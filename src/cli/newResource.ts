import Enquirer from 'enquirer';
import * as fs from 'fs';
import * as path from 'path';
import ts from 'typescript';
import * as JSON5 from 'json5';

export interface ParsedOptions {
    branch: string;
    help: boolean;
}

function parseOptions(args: string[]): ParsedOptions {
    const options: ParsedOptions = {
        branch: 'master',
        help: false,
    };
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];

        if (arg === '--help' || arg === '?' || arg === '-h') {
            options.help = true;
            break;
        }

        console.error(
            `Unexpected argument: ${arg}.\n` +
                `Use \x1b[34m--help \x1b[0mto get available arguments`,
        );
        ts.sys.exit(1);
    }

    return options;
}

function printHelp() {
    console.log(
        '\x1b[0mUsage: \x1b[35mmtasa-lua-utils \x1b[1mnew-resource ' +
            '\x1b[0m[\x1b[34m--help\x1b[0m]\n' +
            '\x1b[0m\n' +
            'Use this command inside a project ' +
            '(directory with \x1b[34mmtasa-meta.yml\x1b[0m)\n' +
            'To create a new resource\n',
    );
}

function validateDirectory(directory: string): boolean {
    return (
        fs
            .readdirSync(directory)
            .filter(
                dir =>
                    dir.indexOf('mtasa-meta.yml') !== -1 ||
                    dir.indexOf('tsconfig.json') !== -1,
            ).length >= 2
    );
}

export interface PromptOptions {
    resourceName: string;
}

function promptData(): Promise<PromptOptions> {
    const context = {
        projectName: '',
    };

    return Enquirer.prompt([
        {
            type: 'input',
            name: 'resourceName',
            message: 'Enter the resource name:',
            result(value: string): string {
                context.projectName = value;
                return value;
            },
        },
    ]);
}

function createNewResourceEnvironment(
    rootDirectory: string,
    options: PromptOptions,
): void {
    const tsconfig = JSON5.parse(
        fs.readFileSync(path.join(rootDirectory, 'tsconfig.json'), 'utf8'),
    );
    const srcDirectory = path.join(
        rootDirectory,
        tsconfig.compilerOptions.rootDir ?? '.',
    );

    const resourceDirectory = path.join(srcDirectory, options.resourceName);
    fs.mkdirSync(resourceDirectory, {
        recursive: true,
    });
    fs.writeFileSync(
        path.join(resourceDirectory, 'server.ts'),
        "import { mtasa } from 'mtasa-lua-types/types/mtasa/server'",
        'utf8',
    );
    fs.writeFileSync(
        path.join(resourceDirectory, 'client.ts'),
        "import { mtasa } from 'mtasa-lua-types/types/mtasa/client'",
        'utf8',
    );
    fs.writeFileSync(path.join(resourceDirectory, 'utils.ts'), '', 'utf8');
}

function appendNewResourceToMeta(
    rootDirectory: string,
    options: PromptOptions,
): void {
    fs.appendFileSync(
        path.join(rootDirectory, 'mtasa-meta.yml'),
        `
---
info:
    name: ${options.resourceName}
    type: script

compilerConfig:
    srcDir: ${options.resourceName}

scripts:
    - src: client.ts
      type: client
      cache: false

    - src: server.ts
      type: server

    - src: utils.ts
      type: shared
      cache: false
`,
        'utf8',
    );
}

export async function newResourceEntrypoint(args: string[]): Promise<void> {
    const options = parseOptions(args);
    if (options.help) {
        printHelp();
        ts.sys.exit(0);
    }

    const rootDirectory = path.resolve('.');
    if (!validateDirectory(rootDirectory)) {
        console.error(
            'Execute this command in the directory with your project\n' +
                'It should contains mtasa-meta.yml and tsconfig.json file.',
        );
        ts.sys.exit(1);
    }

    const promptOptions = await promptData();

    createNewResourceEnvironment(rootDirectory, promptOptions);
    appendNewResourceToMeta(rootDirectory, promptOptions);
}
