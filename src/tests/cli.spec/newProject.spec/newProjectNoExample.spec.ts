import { targetFileCheckTest } from '../../mixins';
import path from 'path';
import fs from 'fs';
import {
    CLI_EXECUTING_TIMEOUT,
    ConsoleSpyType,
    prepareDefaultCliTest,
} from '../mixins';
import { BoilerplateFeatures, newProject } from '../../../cli/newProject';

describe('New Project CLI command (no example resource)', () => {
    const context: {
        consoleSpy: ConsoleSpyType;
    } = {
        consoleSpy: undefined as unknown as ConsoleSpyType, // lazyinit
    };
    const targetPath = 'src/tests/dist/[MyProjectNoExample]';

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
                projectName: 'MyProjectNoExample',
                features: [
                    BoilerplateFeatures.VSCODE,
                    BoilerplateFeatures.GITHUB,
                ],
                continue: true,
                putProjectNameInSquareBrackets: true,
            },
        );
    }, CLI_EXECUTING_TIMEOUT);

    targetFileCheckTest(targetPath, true);
    targetFileCheckTest(path.join(targetPath, '.idea'), false);
    targetFileCheckTest(path.join(targetPath, '.github'), true);
    targetFileCheckTest(path.join(targetPath, '.vscode'), true);
    targetFileCheckTest(path.join(targetPath, 'tsconfig.json'), true);
    targetFileCheckTest(path.join(targetPath, 'mtasa-meta.yml'), true);
    targetFileCheckTest(path.join(targetPath, 'src/TypeScriptResource'), false);

    test('The target file "mtasa-meta.yml" does not contain resource info', () => {
        const content = fs.readFileSync(
            path.join(targetPath, 'mtasa-meta.yml'),
            'utf8',
        );
        expect(content).not.toContain(`srcDir: TypeScriptResource`);
        expect(content).not.toContain(`name: TypeScriptResource`);
    });
});
