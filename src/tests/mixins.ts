import * as child_process from 'child_process';
import * as fs from 'fs';

export interface CompilerProcessContext {
    processOut: string;
    processErr: string;
}

export function callCompilerWithMetaPathBeforeAll(
    filepath: string,
    context: CompilerProcessContext,
    expectedError = false,
): void {
    return callCompilerWithCustomArgsBeforeAll(
        [
            'build',
            '--meta',
            `"${filepath}"`,
            '--project',
            'src/tests/tsconfig.json',
        ],
        context,
        expectedError,
    );
}

export function callCompilerWithCustomArgsBeforeAll(
    args: string[],
    context: CompilerProcessContext,
    expectedError = false,
): void {
    return beforeAll(callback => {
        child_process.exec(
            `node dist/cli.js ${args.join(' ')} `,
            function (error, stdout, stderr) {
                if (!!error !== expectedError) {
                    console.log('stdout:', stdout);
                    console.error('stderr:', stderr);
                    callback(
                        error ??
                            'Expected an error, got successfully completed process',
                    );
                    return;
                }

                context.processOut = stdout;
                context.processErr = stderr;
                callback();
            },
        );
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
            expect(context.processOut).toContain(message);
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
