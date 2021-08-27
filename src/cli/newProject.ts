import Enquirer from 'enquirer';
import * as fs from 'fs';
import * as unzip from 'unzipper';
import * as https from 'https';
import * as path from 'path';
import ts from 'typescript';

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

export interface PromptOptions {
    projectName: string;
    continue: boolean;
    putProjectNameInSquareBrackets: boolean;
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
                          '\n\x1b[31m!\x1b[0m\x1b[1m Are you sure you want to continue?',
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

function promptData(): Promise<PromptOptions> {
    const context = {
        projectName: '',
    };

    return Enquirer.prompt([
        {
            type: 'input',
            name: 'projectName',
            message: 'Enter the project name:',
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
        },
    ]);
}

export function getBoilerplateUrl(branch: string): string {
    return `https://codeload.github.com/mtasa-typescript/resource-boilerplate/zip/refs/heads/${branch}`;
}

async function downloadBoilerplate(
    directory: string,
    branch: string,
): Promise<void> {
    const downloadDir = fs.mkdtempSync('mtasa-resource-boilerplate', 'utf8');

    await new Promise<void>((resolve, reject) => {
        const url = getBoilerplateUrl(branch);
        const request = https.get(url, {}, function (response) {
            if (response.statusCode !== 200) {
                reject(
                    'Check your internet connecting and specified branch\n' +
                        `Also, try to open this URL manually: ${url}\n` +
                        `Response status code: \x1b[1;31m${response.statusCode}\x1b[0m`,
                );
            }

            const unzipPipe = response.pipe(
                unzip.Extract({ path: downloadDir }),
            );
            unzipPipe.on('error', err => {
                console.error('\x1b[31mError happen while unzipping\x1b[0m');
                reject(err);
            });
            unzipPipe.on('close', () => {
                console.log('Download complete\x1b[0m');
                resolve();
            });
        });
        request.on('error', err => {
            console.error(
                '\x1b[31mError happen while performing request\x1b[0m',
            );
            reject(err);
        });
    }).catch(error => {
        console.error(
            '\x1b[31mError happen while downloading boilerplate:\x1b[0m\n' +
                error,
        );
        ts.sys.exit(1);
    });

    console.log('Resource \x1b[32mdownloaded successfully\x1b[0m');

    fs.renameSync(
        path.join(downloadDir, `resource-boilerplate-${branch}`),
        directory,
    );
}

function prepareEnvironment(
    rootDirectory: string,
    options: PromptOptions,
): {
    projectName: string;
    directory: string;
} {
    const projectName = options.putProjectNameInSquareBrackets
        ? `[${options.projectName}]`
        : options.projectName;
    const directory = path.join(rootDirectory, projectName);

    return {
        projectName,
        directory,
    };
}

function updatePackageJson(directory: string, options: PromptOptions): void {
    let text = fs.readFileSync(path.join(directory, 'package.json'), 'utf8');
    text = text.replace(
        /"name": +"[^"]+"/g,
        `"name": "${options.projectName}"`,
    );
    fs.writeFileSync(path.join(directory, 'package.json'), text, 'utf8');
}

export async function newProjectEntrypoint(args: string[]): Promise<void> {
    const options = parseOptions(args);
    if (options.help) {
        printHelp();
        ts.sys.exit(0);
    }

    const rootDirectory = path.resolve('.');
    const promptOptions = await promptData();
    const { directory } = prepareEnvironment(rootDirectory, promptOptions);

    await promptAfterValidation(
        {
            warnDirectoryIsNotEmpty: !validateDirectory(directory),
        },
        directory,
    );

    await downloadBoilerplate(directory, options.branch);
    updatePackageJson(directory, promptOptions);
}
