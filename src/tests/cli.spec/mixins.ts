import fs from 'fs';
import * as path from 'path';

export type ConsoleSpyType = jest.SpyInstance<
    void,
    [message?: string, ...additionalMessage: string[]]
>;

export function prepareDefaultCliTest(
    data: {
        consoleSpy?: ConsoleSpyType;
    },
    targetPath: string,
): void {
    beforeAll(() => {
        data.consoleSpy = jest.spyOn(console, 'log');
        fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    });
}

export function consoleLogContains(
    data: {
        consoleSpy: ConsoleSpyType;
    },
    content: string[],
): void {
    content.forEach(message =>
        test(`console.log contains message: "${message}"`, () => {
            expect(
                data.consoleSpy.mock.calls.map(v => v.join(' ')).join('\n'),
            ).toContain(message);
        }),
    );
}

export const CLI_EXECUTING_TIMEOUT = 60000;

export function prepareProjectEnvironment(directory: string): void {
    beforeAll(() => {
        fs.mkdirSync(directory, { recursive: true });
        fs.writeFileSync(path.join(directory, 'mtasa-meta.yml'), '', 'utf8');
        fs.writeFileSync(
            path.join(directory, 'tsconfig.json'),
            '{"compilerOptions":{"rootDir":"src"}}',
            'utf8',
        );
        fs.mkdirSync(path.join(directory, 'src'), { recursive: true });
    });
}
