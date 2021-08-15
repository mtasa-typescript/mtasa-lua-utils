import {
    CompilerOptions,
    createDiagnosticReporter,
    parseConfigFileWithSystem,
} from 'typescript-to-lua';
import ts from 'typescript';
import {
    appendCommandLineOptionDeclarations,
    getMtasaMetaPath,
    parseCommandLine,
} from './compiler/cli';
import { readMeta } from './compiler/meta/reader';
import { locateConfigFile } from 'typescript-to-lua/dist/cli/tsconfig';
import { executeCompilerForAllResources } from './compiler/compile';
import fs from 'fs';
import { js2xml, xml2js } from 'xml-js';

const reportDiagnostic = createDiagnosticReporter(false);

appendCommandLineOptionDeclarations();
const parsed = parseCommandLine(ts.sys.args);
if (parsed.errors.length > 0) {
    for (const error of parsed.errors) {
        reportDiagnostic(error);
    }
    ts.sys.exit(ts.ExitStatus.DiagnosticsPresent_OutputsSkipped);
}
const configFileName = locateConfigFile(parsed);

if (typeof configFileName === 'object') {
    reportDiagnostic(configFileName);
    ts.sys.exit(ts.ExitStatus.DiagnosticsPresent_OutputsSkipped);
}

const configParseResult = parseConfigFileWithSystem(configFileName as string);
const compilerOptions: CompilerOptions = {
    ...configParseResult.options,
    ...parsed.options,
};

const metaData = readMeta(getMtasaMetaPath(compilerOptions));
executeCompilerForAllResources(compilerOptions, metaData);
