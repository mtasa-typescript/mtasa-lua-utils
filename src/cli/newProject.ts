import Enquirer from 'enquirer';
import * as fs from 'fs';
import * as unzip from 'unzipper';
import * as https from 'https';
import * as path from 'path';
import ts from 'typescript';
import * as child_process from 'child_process';
import {
    deleteFolderSyncRecursive,
    EnquirerArrayPromptOptions,
    EnquirerChoiceExtended,
    EnquirerMultiSelectPromptOptions,
    EnquirerPromptOptionsExtended,
} from './utils';

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

        if (arg === '--branch') {
            if (i + 1 >= args.length) {
                console.error(
                    'Expected usage: \x1b[34m--branch \x1b[1;34mbranchName\x1b[0m\n' +
                        '    Use \x1b[34m--help \x1b[0mto get more information',
                );
                ts.sys.exit(1);
            }

            options.branch = args[i + 1];
            ++i;
            continue;
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
    const spacer = '                                    ';
    console.log(
        '\x1b[0mUsage: \x1b[35mmtasa-lua-utils \x1b[1mnew-resource ' +
            '\x1b[0m[\x1b[34m--help\x1b[0m]\n' +
            spacer +
            '\x1b[0m[\x1b[34m--branch \x1b[1;34mmaster\x1b[0m] ' +
            '\x1b[0m\n' +
            '\x1b[0m\n' +
            'Arguments:\n' +
            '    \x1b[34m--help\x1b[0m              Reveals help message\n' +
            '    \x1b[34m--branch \x1b[1;34m<string>\x1b[0m   Download boilerplate from specified branch\n' +
            '      List of branches: \x1b[34mhttps://github.com/mtasa-typescript/resource-boilerplate/branches\x1b[0m',
    );
}

function validateDirectory(directory: string): boolean {
    return !fs.existsSync(directory);
}

export const enum BoilerplateFeatures {
    WEB_STORM = 'webstorm',
    VSCODE = 'vscode',
    GITHUB = 'github',
    EXAMPLE_RESOURCE = 'example',
}

export interface PromptResults {
    projectName: string;
    continue: boolean;
    putProjectNameInSquareBrackets: boolean;
    features: BoilerplateFeatures[];
}

function promptAfterValidation(
    options: {
        warnDirectoryIsNotEmpty: boolean;
    },
    directory: string,
) {
    let warning = '';
    if (options.warnDirectoryIsNotEmpty) {
        warning +=
            'Execute this script inside an empty directory.\n' +
            `  Directory \x1b[34m${directory}\x1b[0m \x1b[1malready exists\x1b[0m.\n`;
    }

    return Enquirer.prompt([
        ...(warning
            ? [
                  {
                      type: 'toggle',
                      name: 'continue',
                      message:
                          warning +
                          '\n\x1b[31m⛊\x1b[0m\x1b[1m Are you sure you want to continue?',
                      initial: false,
                      result(result: string): string | Promise<string> {
                          if (!result) {
                              console.log('Exiting...');
                              ts.sys.exit(1);
                          }
                          return result;
                      },
                  },
              ]
            : []),
    ]);
}

// See https://github.com/enquirer/enquirer/issues/370
function getPromptFeatureMultiSelect(): EnquirerArrayPromptOptions {
    const indicator: EnquirerChoiceExtended['indicator'] = function (
        _,
        choice,
    ) {
        return choice.enabled ? '▶ ' : '> ';
    };
    const spacer = '\n   ';

    return {
        type: 'multiselect',
        name: 'features',
        initial: [0, 3],
        message:
            '\x1b[0m\x1b[1mSelect features you would like to use in your project\x1b[0m\n' +
            '\x1b[36m>\x1b[0m Use \x1b[34mSpace\x1b[0m to select feature ' +
            'and \x1b[34mEnter\x1b[0m to confirm\x1b[0m',
        choices: [
            {
                name: '\x1b[1mVS Code configuration\x1b[0m',
                value: BoilerplateFeatures.VSCODE,
                hint: spacer + 'Select, if you are going to use VS Code\x1b[0m',
                indicator: indicator,
            },
            {
                name: '\x1b[1mWebStorm configuration\x1b[0m',
                value: BoilerplateFeatures.WEB_STORM,
                hint:
                    spacer +
                    'Select, if you are going to use JetBrains WebStorm\x1b[0m',
                indicator: indicator,
            },
            {
                name: '\x1b[1mGitHub configuration\x1b[0m',
                value: BoilerplateFeatures.GITHUB,
                hint:
                    spacer +
                    'Select, if you are going to create ' +
                    'open-source project and use GitHub\x1b[0m',
                indicator: indicator,
            },
            {
                name: '\x1b[1mExample Resource\x1b[0m',
                value: BoilerplateFeatures.EXAMPLE_RESOURCE,
                hint:
                    spacer +
                    'Select, if you would like the example resource ' +
                    'to appear in the project\x1b[0m',
                indicator: indicator,
            },
        ],
    } as EnquirerMultiSelectPromptOptions;
}

function promptData(): Promise<PromptResults> {
    const context: Partial<PromptResults> = {};

    return Enquirer.prompt([
        {
            type: 'input',
            name: 'projectName',
            message: 'Enter the project name:',
            validate(value: string): boolean {
                return !!value;
            },
            result(value: string): string {
                context.projectName = value;
                return value;
            },
        },
        {
            type: 'toggle',
            name: 'putProjectNameInSquareBrackets',
            message: () =>
                `If the name is in square brackets (like, \x1b[34m[${context.projectName}]\x1b[0m), ` +
                'MTASA will correctly determine compiled resource\n' +
                '\x1b[36m>\x1b[0m\x1b[1m Would you like to put your project name into square brackets?',
            initial: true,
            result(value): string {
                // See https://github.com/enquirer/enquirer/issues/370
                context.putProjectNameInSquareBrackets =
                    value as unknown as boolean;
                return value;
            },
        },
        {
            ...getPromptFeatureMultiSelect(),
            result(value: readonly string[]): string[] {
                const mapped = Object.values(this.map(value));
                context.features = mapped as BoilerplateFeatures[];
                return mapped;
            },
        } as EnquirerMultiSelectPromptOptions,
        {
            type: 'toggle',
            name: 'continue',
            prefix: '⚒',
            message: () =>
                `Directory will be created \x1b[34m${path.resolve(
                    getProjectName({
                        projectName: context.projectName ?? 'undefined',
                        putProjectNameInSquareBrackets:
                            context.putProjectNameInSquareBrackets ?? true,
                    }),
                )}` +
                '\x1b[0m\n' +
                '\x1b[36m⚒\x1b[0m Command \x1b[34mnpm install -D\x1b[0m ' +
                'will be called inside the directory ' +
                'to initialize the project' +
                '\x1b[0m\n' +
                '\x1b[36m⚒\x1b[0m \x1b[1mConfirm?\x1b[0m',
            initial: true,
            result(result: string): string {
                if (!result) {
                    console.log('Exiting...');
                    ts.sys.exit(1);
                }
                return result;
            },
        } as EnquirerPromptOptionsExtended,
    ]);
}

export function getBoilerplateUrl(branch: string): string {
    return `https://codeload.github.com/mtasa-typescript/resource-boilerplate/zip/refs/heads/${branch}`;
}

async function downloadBoilerplate(
    directory: string,
    branch: string,
): Promise<void> {
    console.log('\x1b[36m♢\x1b[0m Downloading boilerplate');
    const downloadDir = fs.mkdtempSync('mtasa-resource-boilerplate', 'utf8');

    await new Promise<void>((resolve, reject) => {
        const url = getBoilerplateUrl(branch);
        const request = https.get(url, {}, function (response) {
            if (response.statusCode !== 200) {
                reject(
                    '\x1b[31m⛊\x1b[0m Check your internet connecting and specified branch\n' +
                        `\x1b[31m⛊\x1b[0m Also, try to open this URL manually: ${url}\n` +
                        `\x1b[31m⛊\x1b[0m Response status code: \x1b[1;31m${response.statusCode}\x1b[0m`,
                );
            }

            const unzipPipe = response.pipe(
                unzip.Extract({ path: downloadDir }),
            );
            unzipPipe.on('error', err => {
                console.error(
                    '\x1b[31m⛊\x1b[0m ' +
                        '\x1b[31mError happen while unzipping\x1b[0m',
                );
                reject(err);
            });
            unzipPipe.on('close', () => {
                console.log('\x1b[32m♦\x1b[0m Download complete\x1b[0m');
                resolve();
            });
        });
        request.on('error', err => {
            console.error(
                '\x1b[31m⛊\x1b[0m ' +
                    '\x1b[31mError happen while performing request\x1b[0m',
            );
            reject(err);
        });
    }).catch(error => {
        console.error(
            '\x1b[31m⛊\x1b[0m ' +
                '\x1b[31mError happen while downloading boilerplate:\x1b[0m\n' +
                error,
        );
        deleteFolderSyncRecursive(downloadDir);
        ts.sys.exit(1);
    });

    console.log(
        '\x1b[32m♦\x1b[0m The boilerplate unpacked successfully\x1b[0m',
    );

    fs.renameSync(
        path.join(downloadDir, `resource-boilerplate-${branch}`),
        directory,
    );
    deleteFolderSyncRecursive(downloadDir);
    console.log(
        `\x1b[32m♦\x1b[0m Filled the directory ` +
            `\x1b[34m${directory}\x1b[0m`,
    );
}

function getProjectName(options: {
    putProjectNameInSquareBrackets: boolean;
    projectName: string;
}) {
    return options.putProjectNameInSquareBrackets
        ? `[${options.projectName}]`
        : options.projectName;
}

function getEnvironmentData(
    rootDirectory: string,
    options: PromptResults,
): {
    projectName: string;
    directory: string;
} {
    const projectName = getProjectName(options);
    const directory = path.join(rootDirectory, projectName);

    return {
        projectName,
        directory,
    };
}

export function camelToKebabCase(str: string): string {
    if (!str) {
        return '';
    }
    str = str[0].toLowerCase() + str.slice(1);
    return str.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
}

type PostProcessFunction = (directory: string, options: PromptResults) => void;

const updatePackageJson: PostProcessFunction = function (directory, options) {
    let text = fs.readFileSync(path.join(directory, 'package.json'), 'utf8');
    text = text.replace(
        /"name": +"[^"]+"/g,
        `"name": "${camelToKebabCase(options.projectName)}"`,
    );
    fs.writeFileSync(path.join(directory, 'package.json'), text, 'utf8');
};

const setFeatures: PostProcessFunction = function (directory, options) {
    console.log(`\x1b[36m♢\x1b[0m Setting up features\x1b[0m`);
    const features = options.features;
    if (!features.includes(BoilerplateFeatures.VSCODE)) {
        deleteFolderSyncRecursive(path.join(directory, '.vscode'));

        console.log(`\x1b[32m♦\x1b[0m Removed VSCode feature\x1b[0m`);
    }

    if (!features.includes(BoilerplateFeatures.WEB_STORM)) {
        deleteFolderSyncRecursive(path.join(directory, '.idea'));

        console.log(`\x1b[32m♦\x1b[0m Removed WebStorm feature\x1b[0m`);
    }

    if (!features.includes(BoilerplateFeatures.GITHUB)) {
        deleteFolderSyncRecursive(path.join(directory, '.github'));

        console.log(`\x1b[32m♦\x1b[0m Removed GitHub feature\x1b[0m`);
    }

    if (!features.includes(BoilerplateFeatures.EXAMPLE_RESOURCE)) {
        deleteFolderSyncRecursive(
            path.join(directory, 'src/TypeScriptResource'),
        );
        fs.rmSync(path.join(directory, 'mtasa-meta.yml'));
        fs.writeFileSync(path.join(directory, 'mtasa-meta.yml'), '', 'utf8');

        console.log(`\x1b[32m♦\x1b[0m Removed Example Resource\x1b[0m`);
    }

    console.log(`\x1b[32m♦\x1b[0m Features setup complete\x1b[0m`);
};

const execInit: PostProcessFunction = function (directory, options) {
    console.log(`\x1b[36m♢\x1b[0m Downloading Node Modules\x1b[0m`);
    child_process.execSync('npm install -D', {
        cwd: directory,
        stdio: ['inherit', 'inherit', 'inherit'],
    });
    console.log(`\x1b[32m♦\x1b[0m Node Modules prepared\x1b[0m`);
};

const showSuccessMessage: PostProcessFunction = function (directory, options) {
    console.log(
        '\n\x1b[36m>\x1b[0m ' +
            `Project \x1b[34m${options.projectName}\x1b[0m ` +
            'has been created.\x1b[0m' +
            '\n  \x1b[34m' +
            directory +
            '\x1b[0m\n\n' +
            '\x1b[36m>\x1b[0m ' +
            'Use \x1b[34mnpm run new-resource\x1b[0m inside ' +
            'the project directory to create new resource\n' +
            '\x1b[36m>\x1b[0m ' +
            'Use \x1b[34mnpm run build\x1b[0m inside ' +
            'the project directory to build code',
    );
};

export async function newProject(
    rootDirectory: string,
    targetDirectory: string,
    options: ParsedOptions,
    promptResults: PromptResults,
): Promise<void> {
    await downloadBoilerplate(targetDirectory, options.branch);

    (<PostProcessFunction[]>[
        updatePackageJson,
        setFeatures,
        execInit,
        showSuccessMessage,
    ]).forEach(fun => fun(targetDirectory, promptResults));
}

export async function newProjectEntrypoint(args: string[]): Promise<void> {
    const options = parseOptions(args);
    if (options.help) {
        printHelp();
        ts.sys.exit(0);
    }

    const rootDirectory = path.resolve('.');
    const promptResults = await promptData();
    const { directory: targetDirectory } = getEnvironmentData(
        rootDirectory,
        promptResults,
    );

    await promptAfterValidation(
        {
            warnDirectoryIsNotEmpty: !validateDirectory(targetDirectory),
        },
        targetDirectory,
    );

    await newProject(rootDirectory, targetDirectory, options, promptResults);
}
