import {
    callCliWithCustomArgsBeforeAll,
    CompilerProcessContext,
    stderrContainsMessages,
} from '../mixins';

describe('CLI command with --help', () => {
    const context: CompilerProcessContext = {
        processOut: '',
        processErr: '',
    };

    callCliWithCustomArgsBeforeAll(['--help'], context, false, {
        stdinContent: [],
    });

    stderrContainsMessages(context, [
        'mtasa-lua-utils version',
        'Usage:',
        'Commands:',
        'build',
        'new-resource',
        'new-project',
    ]);
});
