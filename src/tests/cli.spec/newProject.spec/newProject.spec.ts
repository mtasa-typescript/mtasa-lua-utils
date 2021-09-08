import { targetFileCheckTest } from '../../mixins';
import path from 'path';
import fs from 'fs';
import { BoilerplateFeatures, newProject } from '../../../cli/newProject';
import {
    CLI_EXECUTING_TIMEOUT,
    consoleLogContains,
    ConsoleSpyType,
    prepareDefaultCliTest,
} from '../mixins';

describe('New Project CLI command', () => {
    const context: {
        consoleSpy: ConsoleSpyType;
    } = {
        consoleSpy: undefined as unknown as ConsoleSpyType, // lazyinit
    };
    const targetPath = 'src/tests/dist/[MyProject]';

    prepareDefaultCliTest(context, targetPath);

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
    }, CLI_EXECUTING_TIMEOUT);

    consoleLogContains(context, [
        '[MyProject]',
        'Download complete',
        'Filled the directory',
        'Features setup complete',
        'Node Modules prepared',
        'has been created',
        'npm run new-resource',
        'npm run build',
    ]);

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
