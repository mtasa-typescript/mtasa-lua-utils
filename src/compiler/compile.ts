import ts, { Diagnostic, DiagnosticCategory } from 'typescript';
import { CompilerOptions } from './cli';
import { MTASAMeta } from './meta/types';
import * as fs from 'fs';
import * as path from 'path';
import {
    createDiagnosticReporter,
    LuaLibImportKind,
    transpileFiles,
} from 'typescript-to-lua';
import {
    getResourceData,
    getScriptsFromMeta,
    MetaScriptsBySide,
    ResourceData,
    showDiagnosticAndExit,
    simpleTsDiagnostic,
} from './utils';
import { generateResourceMetaContent } from './meta/writer';
import { validateOptions } from './validate';
import { normalizeSlashes } from 'typescript-to-lua/dist/utils';

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
    const configCheckDiagnositcs = validateOptions(options);
    showDiagnosticAndExit(configCheckDiagnositcs, reportDiagnostic);

    for (const resourceMeta of metaData) {
        const data = getResourceData(options, resourceMeta);

        let partialDiagnostics = compileAttachedFiles(
            options,
            resourceMeta,
            data,
        );
        showDiagnosticAndExit(partialDiagnostics, reportDiagnostic);

        partialDiagnostics = compileResourceScripts(
            options,
            resourceMeta,
            data,
        );
        showDiagnosticAndExit(partialDiagnostics, reportDiagnostic);

        partialDiagnostics = compileResourceBundledScripts(
            options,
            resourceMeta,
            data,
        );
        showDiagnosticAndExit(partialDiagnostics, reportDiagnostic);

        if (options.tstlVerbose) {
            console.log(
                `Generating meta.xml for "${data.verboseName}" resource`,
            );
        }
        const metaContent = generateResourceMetaContent(resourceMeta, data);
        const metaPath = path.join(data.outDir, 'meta.xml');
        fs.writeFileSync(metaPath, metaContent);
    }
}

/**
 * Copies all files into the destination directory
 */
export function compileAttachedFiles(
    options: Readonly<CompilerOptions>,
    meta: Readonly<MTASAMeta>,
    data: Readonly<ResourceData>,
): Diagnostic[] {
    if (meta.files === undefined || meta.files.length === 0) {
        return [];
    }

    const files = meta.files.filter(
        file => file.doCompileCheck === undefined || file.doCompileCheck,
    );
    const diagnosticResults: Diagnostic[] = [];

    if (options.tstlVerbose) {
        console.log(`Copying files for "${data.verboseName}" resource...`);
    }

    for (const file of files) {
        const rootSrc = path.join(data.rootDir, file.src);
        const outSrc = path.join(data.outDir, file.src);
        const dirname = path.dirname(outSrc);

        try {
            fs.mkdirSync(dirname, { recursive: true });
            fs.copyFileSync(rootSrc, outSrc);
        } catch (e) {
            diagnosticResults.push(
                simpleTsDiagnostic(e.toString(), DiagnosticCategory.Error),
            );
        }
    }

    return diagnosticResults;
}

/**
 * Converts scripts, defined in `scripts` object into the result files
 */
export function compileResourceBundledScripts(
    options: Readonly<CompilerOptions>,
    meta: Readonly<MTASAMeta>,
    data: Readonly<ResourceData>,
): Diagnostic[] {
    const scripts = getScriptsFromMeta(meta);
    let diagnosticResults: Diagnostic[] = [];

    for (const key of Object.keys(scripts)) {
        const newOptions: CompilerOptions = {
            ...options,
            luaLibImport: LuaLibImportKind.Require,
            rootDir: data.rootDir,
            outDir: data.outDir,
        };
        const scriptList = scripts[key as keyof MetaScriptsBySide];

        if (newOptions.tstlVerbose) {
            console.log(
                `Compiling ${key} bundled scripts for "${data.verboseName}" resource...`,
            );
        }

        const scriptsToBuild: {
            in: string;
            out: string;
        }[] = scriptList
            .filter(script => script.bundled)
            .map(script => ({
                in: normalizeSlashes(path.join(data.rootDir, script.src)),
                out: normalizeSlashes(
                    path.join(data.outDir, script.src.replace(/\.ts$/, '.lua')),
                ),
            }));

        for (const script of scriptsToBuild) {
            const scriptOptions: CompilerOptions = {
                ...newOptions,
                luaBundle: script.out,
                luaBundleEntry: script.in,
            };

            const result = transpileFiles(
                [script.in],
                scriptOptions,
                writeData,
            );

            diagnosticResults = [...diagnosticResults, ...result.diagnostics];
        }
    }

    return diagnosticResults;
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
        const newOptions: CompilerOptions = {
            ...options,
            rootDir: data.rootDir,
            outDir: data.outDir,
        };
        const scriptList = scripts[key as keyof MetaScriptsBySide];

        if (newOptions.tstlVerbose) {
            console.log(
                `Compiling ${key} scripts for "${data.verboseName}" resource...`,
            );
        }

        const scriptsToBuild = scriptList
            .filter(script => !script.bundled)
            .map(script =>
                normalizeSlashes(path.join(data.rootDir, script.src)),
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
