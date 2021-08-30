import {
    callCliWithCustomArgsBeforeAll,
    CompilerProcessContext,
    stderrContainsMessages,
} from '../../mixins';

describe('New Project CLI command with wrong argument', () => {
    const context: CompilerProcessContext = {
        processOut: '',
        processErr: '',
    };

    callCliWithCustomArgsBeforeAll(
        ['new-project', '--unexpected-argument'],
        context,
        true,
    );

    stderrContainsMessages(context, ['Unexpected argument', '--help']);
});
