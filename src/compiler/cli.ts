import * as tstl from 'typescript-to-lua';
import { optionDeclarations } from 'typescript-to-lua/dist/cli/parse';

export interface CompilerOptions extends tstl.CompilerOptions {
    meta?: string;
}

export interface ParsedCommandLine extends tstl.ParsedCommandLine {
    options: CompilerOptions;
}

export function appendCommandLineOptionDeclarations(): void {
    optionDeclarations.push({
        name: 'meta',
        type: 'string',
        description: 'Custom mtasa-meta.yml file path',
    });
}

export function parseCommandLine(args: string[]): ParsedCommandLine {
    return tstl.parseCommandLine(args);
}

export function getMtasaMetaPath(options: CompilerOptions): string {
    return options.meta ?? 'mtasa-meta.yml';
}
