import { MTASAMeta, Script } from './meta/types';
import { CompilerOptions } from './cli';
import { normalizeSlashes } from 'typescript-to-lua/dist/utils';
import path from 'path';
import ts, { Diagnostic, DiagnosticCategory } from 'typescript';

export interface MetaScriptsBySide {
    client: Script[];
    server: Script[];
}

export function getScriptsFromMeta(
    metaData: Readonly<MTASAMeta>,
): MetaScriptsBySide {
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

export interface ResourceData {
    verboseName: string;
    rootDir: string;
    outDir: string;
}

export function getResourceVerboseName(
    resourceMeta: Readonly<MTASAMeta>,
): string {
    if (resourceMeta.info.name) {
        return resourceMeta.info.name;
    }

    if (resourceMeta.compilerConfig.resourceDirectoryName) {
        return resourceMeta.compilerConfig.resourceDirectoryName;
    }

    return resourceMeta.compilerConfig.srcDir;
}

export function getResourceData(
    options: Readonly<CompilerOptions>,
    resourceMeta: Readonly<MTASAMeta>,
): ResourceData {
    return {
        verboseName: getResourceVerboseName(resourceMeta),
        rootDir: normalizeSlashes(
            path.join(
                options.rootDir ?? '.',
                resourceMeta.compilerConfig.srcDir,
            ),
        ),
        outDir: normalizeSlashes(
            path.join(
                options.outDir ?? '.',
                resourceMeta.compilerConfig.resourceDirectoryName ??
                    resourceMeta.compilerConfig.srcDir,
            ),
        ),
    };
}

export function simpleTsDiagnostic(
    message: string,
    category: DiagnosticCategory,
): Diagnostic {
    return {
        messageText: message,
        code: 1,
        category: category,
        file: undefined,
        length: undefined,
        start: undefined,
    };
}

export function showDiagnosticAndExit(
    diagnosticResults: readonly Diagnostic[],
    reportDiagnostic: (d: Diagnostic) => void,
): void {
    if (diagnosticResults.length !== 0) {
        for (const diagnostic of diagnosticResults) {
            reportDiagnostic(diagnostic);
        }

        return ts.sys.exit(ts.ExitStatus.DiagnosticsPresent_OutputsSkipped);
    }
}

export function extendOptions(
    options: Readonly<CompilerOptions>,
    meta: Readonly<MTASAMeta>,
    data: Readonly<ResourceData>,
): CompilerOptions {
    return {
        ...options,
        resourceSpecific: {
            ...meta.compilerConfig,
        },
        rootDir: data.rootDir,
        outDir: data.outDir,
    };
}

export function getEmptyTsFilePath(): string {
    return normalizeSlashes(
        path.join(__dirname, '../../src/compiler/empty.ts'),
    );
}
