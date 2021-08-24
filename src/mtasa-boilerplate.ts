import Enquirer from 'enquirer';
import * as fs from 'fs';
import * as unzip from 'unzipper';
import * as https from 'https';
import * as path from 'path';
import mv from 'mv';
import ts from 'typescript';

function validateDirectory(directory: string): boolean {
    return fs.readdirSync(directory).length === 0;
}

function checkDirectoryName(directory: string): boolean {
    const basename = path.basename(directory);
    return basename.startsWith('[') && basename.endsWith(']');
}

function promptData(
    options: {
        warnDirectoryIsNotEmpty: boolean;
        warnAboutDirectoryName: boolean;
    },
    directory: string,
) {
    let warning = '';
    if (options.warnDirectoryIsNotEmpty) {
        warning +=
            'Execute this script inside an empty directory.\n' +
            `  Directory "${directory}" expected to be empty.\n`;
    }
    if (options.warnAboutDirectoryName) {
        warning +=
            'Expected directory name in square brackets, for example, ' +
            `"[${path.basename(directory)}]"\n`;
    }

    return Enquirer.prompt([
        ...(warning
            ? [
                {
                    type: 'toggle',
                    name: 'continue',
                    message: warning + '\nAre you sure you want to continue?',
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

const BOILERPLATE_URL =
    'https://codeload.github.com/mtasa-typescript/resource-boilerplate/zip/refs/heads/master';

function downloadBoilerplate(directory: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        const request = https.get(BOILERPLATE_URL, {}, function(response) {
            const unzipPipe = response.pipe(unzip.Extract({ path: './' }));
            unzipPipe.on('error', err => {
                console.error('Error happen while unzipping');
                reject(err);
            });
            unzipPipe.on('close', () => {
                console.log('Downloading complete');
                resolve();
            });
        });
        request.on('error', err => {
            console.error('Error happen while performing request');
            reject(err);
        });
    })
        .then(() => {
            console.log('Resource downloaded successfully');
            mv(
                path.join(directory, 'resource-boilerplate-master'),
                directory,
                { mkdirp: false, clobber: false },
                function(err) {
                    if (err === null) {
                        return;
                    }

                    console.error('Error happen');
                    console.error(err);
                    ts.sys.exit(1);
                },
            );
        })
        .catch(error => {
            console.error(
                'Error happen while downloading boilerplate:\n' + error,
            );
            ts.sys.exit(1);
        });
}

async function boilerplateEntrypoint() {
    // request('http://example.com/foo.gz').pipe(zlib.createUnzip()).pipe(out);
    const directory = path.resolve('.');
    await promptData(
        {
            warnDirectoryIsNotEmpty: !validateDirectory(directory),
            warnAboutDirectoryName: !checkDirectoryName(directory),
        },
        directory,
    );

    await downloadBoilerplate(directory);
}

boilerplateEntrypoint()
    .then(r => console.log('MTASA Boilerplate has been set up successfully'))
    .catch();
