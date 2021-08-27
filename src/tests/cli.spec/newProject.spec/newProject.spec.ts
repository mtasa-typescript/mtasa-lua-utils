import {
    callCliWithCustomArgsBeforeAll,
    CompilerProcessContext,
    stderrEmptyTest,
    stdoutContainsMessages,
    targetFileCheckTest,
} from '../../mixins';
import { CLI_ENQUIRER_KEY } from '../../cliUtil';
import path from 'path';
import fs from 'fs';

describe('New Project CLI command', () => {
    const targetPath = 'src/tests/dist/[MyProject]';

    const context: CompilerProcessContext = {
        processOut: '',
        processErr: '',
    };

    callCliWithCustomArgsBeforeAll(
        ['new-project', '--branch', 'develop'],
        context,
        false,
        {
            executable: '../../../dist/cli.js',
            stdinContent: [
                'MyProject',
                CLI_ENQUIRER_KEY.ENTER,
                CLI_ENQUIRER_KEY.ENTER,
            ],
            cwd: 'src/tests/dist',
        },
    );

    stderrEmptyTest(context);
    stdoutContainsMessages(context, [
        'Enter the project name',
        'project name into square brackets',
        '[MyProject]',
        'successfully',
    ]);

    targetFileCheckTest(targetPath, true);
    targetFileCheckTest(path.join(targetPath, '.idea'), true);
    targetFileCheckTest(path.join(targetPath, '.vscode'), true);
    targetFileCheckTest(path.join(targetPath, 'tsconfig.json'), true);
    targetFileCheckTest(path.join(targetPath, 'mtasa-meta.yml'), true);

    test('The target file "package.json" contains project name', () => {
        const content = fs.readFileSync(
            path.join(targetPath, 'package.json'),
            'utf8',
        );
        expect(content).toContain(`"name": "MyProject"`);
    });
});
