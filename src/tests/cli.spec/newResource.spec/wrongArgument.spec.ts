import {
    callCliWithCustomArgsBeforeAll,
    CompilerProcessContext,
    stderrContainsMessages,
} from '../../mixins';

describe('New Resource CLI command with wrong argument', () => {
    const context: CompilerProcessContext = {
        processOut: '',
        processErr: '',
    };

    callCliWithCustomArgsBeforeAll(
        ['new-resource', '--unexpected-argument'],
        context,
        true,
        {
            stdinContent: [],
        },
    );

    stderrContainsMessages(context, ['Unexpected argument', '--help']);
});
