/** @noSelfInFile */
import * as tstl from 'typescript-to-lua';
export interface CompilerOptions extends tstl.CompilerOptions {
    meta?: string;
}
export interface ParsedCommandLine extends tstl.ParsedCommandLine {
    options: CompilerOptions;
}
export declare function appendCommandLineOptionDeclarations(): void;
export declare function parseCommandLine(args: string[]): ParsedCommandLine;
export declare function getMtasaMetaPath(options: CompilerOptions): string;
