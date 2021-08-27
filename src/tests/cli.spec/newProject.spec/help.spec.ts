import {
    callCliWithCustomArgsBeforeAll,
    CompilerProcessContext,
    stderrEmptyTest,
    stdoutContainsMessages,
} from '../../mixins';

describe('New Project CLI command with --help', () => {
    const context: CompilerProcessContext = {
        processOut: '',
        processErr: '',
    };

    callCliWithCustomArgsBeforeAll(['new-project', '--help'], context, false, {
        stdinContent: [],
    });

    stderrEmptyTest(context);
    stdoutContainsMessages(context, [
        'Usage:',
        'Arguments:',
        '--help',
        '--branch',
    ]);
});
