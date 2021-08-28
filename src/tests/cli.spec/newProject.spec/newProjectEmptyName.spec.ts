import {
    callCliWithCustomArgsBeforeAll,
    CompilerProcessContext,
    stderrEmptyTest,
    stdoutContainsMessages,
} from '../../mixins';
import {
    CLI_ENQUIRER_KEY,
    getStdinContentForNewProjectCommand,
} from '../../cliUtils';

describe('New Project CLI command (empty project name)', () => {
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
                '',
                CLI_ENQUIRER_KEY.ENTER,
                ...getStdinContentForNewProjectCommand('MyProject'),
            ],
            cwd: 'src/tests/dist',
        },
    );

    stderrEmptyTest(context);
    stdoutContainsMessages(context, ['Invalid input']);
});
