import {
    callCliWithCustomArgsBeforeAll,
    CompilerProcessContext,
    stderrEmptyTest,
    stdoutContainsMessages,
    targetFileCheckTest,
} from '../mixins';
import { CLI_ENQUIRER_KEY } from '../cliUtil';
import path from 'path';

describe('New Project CLI command', () => {
    const targetPath = 'src/tests/dist/[MyProject]';

    const context: CompilerProcessContext = {
        processOut: '',
        processErr: '',
    };

    callCliWithCustomArgsBeforeAll(['new-project'], context, false, {
        executable: '../../../dist/cli.js',
        stdinContent: [
            'MyProject',
            CLI_ENQUIRER_KEY.ENTER,
            CLI_ENQUIRER_KEY.ENTER,
            CLI_ENQUIRER_KEY.ENTER,
        ],
        cwd: 'src/tests/dist',
    });

    stderrEmptyTest(context);
    stdoutContainsMessages(context, ['project name']);

    targetFileCheckTest(targetPath, true);
    targetFileCheckTest(path.join(targetPath, '.idea'), true);
    targetFileCheckTest(path.join(targetPath, '.vscode'), true);
    targetFileCheckTest(path.join(targetPath, 'tsconfig.json'), true);
    // TODO: targetFileCheckTest(path.join(targetPath, 'mtasa-meta.yml'), true);
});
