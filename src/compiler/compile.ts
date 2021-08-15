import ts, { Diagnostic, DiagnosticCategory } from 'typescript';
import { CompilerOptions } from './cli';
import { MTASAMeta } from './meta/types';
import * as fs from 'fs';
import * as path from 'path';
import { createDiagnosticReporter, transpileFiles } from 'typescript-to-lua';
import {
    getResourceData,
    getScriptsFromMeta,
    MetaScriptsBySide,
    ResourceData,
    simpleTsDiagnostic,
} from './utils';
import { generateResourceMetaContent } from './meta/writer';
import { util } from 'prettier';

const reportDiagnostic = createDiagnosticReporter(false);

const writeData: ts.WriteFileCallback = function (
    fileName,
    data,
    writeByteOrderMark,
    onError,
) {
    const dirname = path.dirname(fileName);
    fs.mkdirSync(dirname, { recursive: true });

    fs.writeFile(path.join(fileName), data, function (err) {
        if (err !== null) {
            if (onError !== undefined) {
                onError(err.message);
            } else {
                console.log(err.message);
            }
        }
    });
};

// export function processScripts

// TODO: WIP
export function executeCompilerForAllResources(
    options: Readonly<CompilerOptions>,
    metaData: readonly MTASAMeta[],
): void {
    let diagnosticResults: Diagnostic[] = [];

    for (const resourceMeta of metaData) {
        const data = getResourceData(options, resourceMeta);

        const partialDiagnostics = compileResourceScripts(
            options,
            resourceMeta,
            data,
        );
        diagnosticResults = [...diagnosticResults, ...partialDiagnostics];

        if (options.tstlVerbose) {
            console.log(
                `Generating meta.xml for "${data.verboseName}" resource`,
            );
        }
        const metaContent = generateResourceMetaContent(resourceMeta);
        const metaPath = path.join(data.outDir, 'meta.xml');
        fs.writeFileSync(metaPath, metaContent);
    }

    if (diagnosticResults.length !== 0) {
        for (const diagnostic of diagnosticResults) {
            reportDiagnostic(diagnostic);
        }

        return ts.sys.exit(ts.ExitStatus.DiagnosticsPresent_OutputsSkipped);
    }
}

/**
 * Converts scripts, defined in `scripts` object into the result files
 */
export function compileResourceScripts(
    options: Readonly<CompilerOptions>,
    meta: Readonly<MTASAMeta>,
    data: Readonly<ResourceData>,
): Diagnostic[] {
    const scripts = getScriptsFromMeta(meta);
    let diagnosticResults: Diagnostic[] = [];

    for (const key of Object.keys(scripts)) {
        const newOptions = {
            ...options,
        };
        const scriptList = scripts[key as keyof MetaScriptsBySide];

        newOptions.rootDir = data.rootDir;
        newOptions.outDir = data.outDir;

        if (newOptions.tstlVerbose) {
            console.log(
                `Compiling ${key} scripts for "${data.verboseName}" resource...`,
            );
        }

        const scriptsToBuild = scriptList
            .filter(script => !script.bundled)
            .map(script =>
                path.join(data.rootDir, script.src).replace(/\\/g, '/'),
            );
        const scriptsToBuildSet = new Set<string>();
        scriptsToBuild.forEach(value =>
            scriptsToBuildSet.add(path.resolve(value)),
        );

        const emittedScripts = new Set<string>();
        const result = transpileFiles(
            scriptsToBuild,
            newOptions,
            function (
                fileName,
                content,
                writeByteOrderMark,
                onError,
                sourceFiles,
            ) {
                if (sourceFiles !== undefined) {
                    for (const file of sourceFiles) {
                        emittedScripts.add(path.resolve(file.fileName));
                    }
                }

                writeData(
                    fileName,
                    content,
                    writeByteOrderMark,
                    onError,
                    sourceFiles,
                );
            },
        );

        for (const scriptPath of emittedScripts) {
            if (scriptsToBuildSet.has(scriptPath)) {
                continue;
            }

            diagnosticResults.push(
                simpleTsDiagnostic(
                    `File '${scriptPath}' is used, ` +
                        `but not specified in mtasa-meta.yml ` +
                        `for "${data.verboseName}" resource`,
                    DiagnosticCategory.Error,
                ),
            );
        }

        diagnosticResults = [...diagnosticResults, ...result.diagnostics];
    }

    return diagnosticResults;
}
