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
} from '../compiler/cli';
import { readMeta } from '../compiler/meta/reader';
import { locateConfigFile } from 'typescript-to-lua/dist/cli/tsconfig';
import { executeCompilerForAllResources } from '../compiler/compile';

const reportDiagnostic = createDiagnosticReporter(false);
appendCommandLineOptionDeclarations();

function printHelp() {
    const spacer = '                             ';
    console.log(
        '\x1b[0mUsage: \x1b[35mmtasa-lua-utils \x1b[1mbuild ' +
            '\x1b[0m[\x1b[34m--help\x1b[0m]\n' +
            spacer +
            '\x1b[0m[\x1b[34m--meta \x1b[1;34mmtasa-meta.yml\x1b[0m]\n' +
            spacer +
            '\x1b[0m[\x1b[34m--project \x1b[1;34mtsconfig.json\x1b[0m]\n' +
            spacer +
            '\x1b[0m[\x1b[34m--tstlVerbose \x1b[1;34mfalse\x1b[0m]\n' +
            '\x1b[0m\n' +
            'Arguments:\n' +
            '    \x1b[34m--help\x1b[0m                    Reveals help message\n' +
            '    \x1b[34m--meta        \x1b[1;34m<string>\x1b[0m    Specify path to mtasa-meta.yml file\n' +
            '    \x1b[34m--project     \x1b[1;34m<string>\x1b[0m    Specify path to tsconfig.json file\n' +
            '    \x1b[34m--tstlVerbose \x1b[1;34m<boolean>\x1b[0m   Provide verbose output useful for diagnosing problems\n',
    );
}

export function buildProject(args: string[]): void {
    const parsed = parseCommandLine(args);
    if (parsed.errors.length > 0) {
        for (const error of parsed.errors) {
            reportDiagnostic(error);
        }
        ts.sys.exit(ts.ExitStatus.DiagnosticsPresent_OutputsSkipped);
    }
    if ((parsed.options as CompilerOptions).help) {
        printHelp();
        ts.sys.exit(0);
    }

    const configFileName = locateConfigFile(parsed);

    if (typeof configFileName === 'object') {
        reportDiagnostic(configFileName);
        ts.sys.exit(ts.ExitStatus.DiagnosticsPresent_OutputsSkipped);
    }

    const configParseResult = parseConfigFileWithSystem(
        configFileName as string,
    );
    const compilerOptions: CompilerOptions = {
        ...configParseResult.options,
        ...parsed.options,
    };

    const metaData = readMeta(getMtasaMetaPath(compilerOptions));
    executeCompilerForAllResources(compilerOptions, metaData);
}
