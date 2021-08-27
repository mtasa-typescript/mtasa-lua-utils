import * as child_process from 'child_process';
import concatStream from 'concat-stream';
import * as fs from 'fs';

export interface CompilerProcessContext {
    processOut: string;
    processErr: string;
}

export interface CliCustomOptions {
    executable?: string;
    stdinContent?: string[];
    cwd?: string;
}

export function callCompilerWithMetaPathBeforeAll(
    filepath: string,
    context: CompilerProcessContext,
    expectedError = false,
    options: Readonly<CliCustomOptions> = {},
): void {
    return callCliWithCustomArgsBeforeAll(
        ['build', '--meta', filepath, '--project', 'src/tests/tsconfig.json'],
        context,
        expectedError,
        options,
    );
}

export function callCliWithCustomArgsBeforeAll(
    args: string[],
    context: CompilerProcessContext,
    expectedError = false,
    options: Readonly<CliCustomOptions> = {},
): void {
    return beforeAll(callback => {
        // See
        // https://github.com/ewnd9/inquirer-test/blob/master/index.js
        const proc = child_process.spawn(
            'node',
            [options.executable ?? 'dist/cli.js', ...args],
            {
                stdio: [null, null, null],
                cwd: options.cwd,
            },
        );
        proc.stdin.setDefaultEncoding('utf8');

        const loop = function (content: readonly string[]) {
            if (content.length > 0) {
                setTimeout(function () {
                    proc.stdin.write(content[0]);
                    loop(content.slice(1));
                }, 200);
            } else {
                proc.stdin.end();
            }
        };

        if (options.stdinContent && options.stdinContent.length !== 0) {
            loop(options.stdinContent);
        }

        proc.stdout.pipe(
            concatStream(function (result) {
                context.processOut = result.toString();
            }),
        );
        proc.stderr.pipe(
            concatStream(function (result) {
                context.processErr = result.toString();
            }),
        );

        proc.on('exit', function (exitCode) {
            console.log('stdout:', context.processOut);
            console.error('stderr:', context.processErr);

            if (exitCode === 0) {
                if (expectedError) {
                    callback(
                        'Expected an error, got successfully completed process',
                    );
                    return;
                }

                callback();
                return;
            }

            if (expectedError) {
                callback();
                return;
            }

            // Error, not expected
            callback(`Unexpected error: ${exitCode}`);
        });
    }, 60000);
}

export function stderrEmptyTest(context: CompilerProcessContext): void {
    return test('STDERR empty', () => {
        expect(context.processErr).toHaveLength(0);
    });
}

export function stdoutContainsMessages(
    context: CompilerProcessContext,
    messages: string[],
): void {
    for (const message of messages) {
        test(`STDOUT contains message "${message}"`, () => {
            expect(context.processOut.toLowerCase()).toContain(
                message.toLowerCase(),
            );
        });
    }
}

export function stderrContainsMessages(
    context: CompilerProcessContext,
    messages: string[],
): void {
    for (const message of messages) {
        test(`STDERR contains message "${message}"`, () => {
            expect(context.processErr.toLowerCase()).toContain(
                message.toLowerCase(),
            );
        });
    }
}

export function targetFileCheckTest(filepath: string, isExists: boolean): void {
    test(
        `The target file "${filepath}"` +
            `${isExists ? 'exists' : 'does not exist'}`,
        () => {
            const result = fs.existsSync(filepath);
            if (isExists) {
                expect(result).toBeTruthy();
            } else {
                expect(result).toBeFalsy();
            }
        },
    );
}

export function targetDirectoryFilesLengthTest(
    filepath: string,
    length: number,
): void {
    test(
        `The target directory "${filepath}"` + `contains ${length} files`,
        () => {
            expect(fs.readdirSync(filepath)).toHaveLength(length);
        },
    );
}
