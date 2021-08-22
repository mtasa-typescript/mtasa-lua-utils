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
        ['--meta', `"${filepath}"`],
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
            `node dist/mtasa-ts-build.js ${args.join(' ')}`,
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
    }, 30000);
}

export function stderrEmptyTest(context: CompilerProcessContext): void {
    return test('STDERR empty', () => {
        expect(context.processErr).toHaveLength(0);
    });
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
