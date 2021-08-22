import * as child_process from 'child_process';
import * as path from 'path';
import { writeFileSync } from 'fs';
import * as fs from 'fs';
import { compilerOptionExpectsAnArgument } from 'typescript-to-lua/dist/cli/diagnostics';

describe('empty resource', () => {
    let processOut: string;
    let processErr: string;

    beforeAll(callback => {
        child_process.exec(
            'node dist/mtasa-ts-build.js --meta tests/resources.spec/emptyResource/mtasa-meta.yml',
            function (error, stdout, stderr) {
                if (error) {
                    callback(error);
                }

                processOut = stdout;
                processErr = stderr;
                callback();
            },
        );
    });

    test('stderr empty', () => {
        expect(processErr).toHaveLength(0);
    });

    test('lualib compiling skipped', () => {
        expect(processOut).toContain('Skipped compiling lualib');
    });

    test('Contains meta.xml', () => {
        expect(
            fs.existsSync('dist/tests/resources.spec/emptyResource'),
        ).toBeTruthy();
        expect(
            fs.existsSync('dist/tests/resources.spec/emptyResource/meta.xml'),
        ).toBeTruthy();
    });

    test('Does not contain any other files (except meta.xml)', () => {
        expect(
            fs.readdirSync('dist/tests/resources.spec/emptyResource'),
        ).toHaveLength(1);
    });
});
