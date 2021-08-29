import { targetFileCheckTest } from '../../mixins';
import path from 'path';
import fs from 'fs';
import { BoilerplateFeatures, newProject } from '../../../cli/newProject';

describe('New Project CLI command', () => {
    let consoleSpy: jest.SpyInstance<
        void,
        [message?: string, ...additionalMessage: string[]]
    >;
    const targetPath = 'src/tests/dist/[MyProject]';

    beforeAll(() => {
        consoleSpy = jest.spyOn(console, 'log');
        fs.mkdirSync('src/tests/dist', { recursive: true });
    });

    beforeAll(async () => {
        await newProject(
            path.basename(targetPath),
            targetPath,
            {
                branch: 'develop',
                help: false,
            },
            {
                projectName: 'MyProject',
                features: [
                    BoilerplateFeatures.VSCODE,
                    BoilerplateFeatures.EXAMPLE_RESOURCE,
                ],
                continue: true,
                putProjectNameInSquareBrackets: true,
            },
        );
    }, 60000);

    [
        '[MyProject]',
        'Download complete',
        'Filled the directory',
        'Features setup complete',
        'Node Modules prepared',
        'has been created',
        'mtasa-lua-utils new-resource',
        'mtasa-lua-utils build',
    ].forEach(message =>
        test(`console.log contains message: "${message}"`, () => {
            expect(
                consoleSpy.mock.calls.map(v => v.join(' ')).join('\n'),
            ).toContain(message);
        }),
    );

    targetFileCheckTest(targetPath, true);
    targetFileCheckTest(path.join(targetPath, '.idea'), false);
    targetFileCheckTest(path.join(targetPath, '.github'), false);
    targetFileCheckTest(path.join(targetPath, '.vscode'), true);
    targetFileCheckTest(path.join(targetPath, 'tsconfig.json'), true);
    targetFileCheckTest(path.join(targetPath, 'mtasa-meta.yml'), true);
    targetFileCheckTest(path.join(targetPath, 'src/TypeScriptResource'), true);

    test('The target file "package.json" contains project name', () => {
        const content = fs.readFileSync(
            path.join(targetPath, 'package.json'),
            'utf8',
        );
        expect(content).toContain(`"name": "my-project"`);
    });

    test('The target file "mtasa-meta.yml" contains resource info', () => {
        const content = fs.readFileSync(
            path.join(targetPath, 'mtasa-meta.yml'),
            'utf8',
        );
        expect(content).toContain(`srcDir: TypeScriptResource`);
        expect(content).toContain(`name: TypeScriptResource`);
    });
});
