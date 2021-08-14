import ts, { Diagnostic, DiagnosticCategory } from 'typescript';
import { CompilerOptions } from './cli';
import { MTASAMeta, Script } from './meta/types';
import * as fs from 'fs';
import * as path from 'path';
import { createDiagnosticReporter, transpileFiles } from 'typescript-to-lua';

const reportDiagnostic = createDiagnosticReporter(false);

const writeData: ts.WriteFileCallback = function (
    fileName,
    data,
    writeByteOrderMark,
    onError,
    sourceFiles,
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

interface MetaScriptsBySide {
    client: Script[];
    server: Script[];
}

function getScriptsFromMeta(metaData: Readonly<MTASAMeta>): MetaScriptsBySide {
    const result: MetaScriptsBySide = {
        client: [],
        server: [],
    };
    if (!metaData.scripts) {
        return result;
    }

    for (const script of metaData.scripts) {
        if (script.type === 'shared') {
            result.client.push(script);
            result.server.push(script);
            continue;
        }

        result[script.type].push(script);
    }

    return result;
}

// TODO: get resource verbose name function

// TODO: WIP
export function executeCompilerForAllResources(
    options: Readonly<CompilerOptions>,
    metaData: readonly MTASAMeta[],
): void {
    let diagnosticResults: Diagnostic[] = [];

    for (const resourceMeta of metaData) {
        const scripts = getScriptsFromMeta(resourceMeta);

        const newRootDir = path.join(
            options.rootDir ?? '.',
            resourceMeta.compilerConfig.srcDir,
        );
        const newOutDir = path.join(
            options.outDir ?? '.',
            resourceMeta.compilerConfig.resourceDirectoryName ??
                resourceMeta.compilerConfig.srcDir,
        );

        for (const key of Object.keys(scripts)) {
            const newOptions = {
                ...options,
            };
            const scriptList = scripts[key as keyof MetaScriptsBySide];

            newOptions.rootDir = newRootDir;
            newOptions.outDir = newOutDir;

            if (newOptions.tstlVerbose) {
                console.log(
                    `Compiling ${key} scripts. Source directory: ${newOptions.rootDir}`,
                );
            }

            const scriptsToBuild = scriptList.map(script =>
                path.join(newRootDir, script.src).replace(/\\/g, '/'),
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
                    data,
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
                        data,
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

                diagnosticResults.push({
                    messageText: `File '${scriptPath}' is used, but not specified in mtasa-meta.yml`,
                    code: 1,
                    category: DiagnosticCategory.Error,
                    file: undefined,
                    length: undefined,
                    start: undefined,
                });
            }

            diagnosticResults = [...diagnosticResults, ...result.diagnostics];
        }
    }

    if (diagnosticResults.length !== 0) {
        for (const diagnostic of diagnosticResults) {
            reportDiagnostic(diagnostic);
        }

        return ts.sys.exit(ts.ExitStatus.DiagnosticsPresent_OutputsSkipped);
    }
}
