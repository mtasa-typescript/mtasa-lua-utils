import {
    callCliWithCustomArgsBeforeAll,
    CompilerProcessContext,
    stderrEmptyTest,
    stdoutContainsMessages,
} from '../../mixins';

describe('New Resource CLI command with --help', () => {
    const context: CompilerProcessContext = {
        processOut: '',
        processErr: '',
    };

    callCliWithCustomArgsBeforeAll(['new-resource', '--help'], context, false);

    stderrEmptyTest(context);
    stdoutContainsMessages(context, [
        'Usage:',
        'Use this command inside a project',
        'To create a new resource',
    ]);
});
