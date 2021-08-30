import {
    callCliWithCustomArgsBeforeAll,
    CompilerProcessContext,
    stderrContainsMessages,
} from '../mixins';

describe('CLI command with wrong subcommand', () => {
    const context: CompilerProcessContext = {
        processOut: '',
        processErr: '',
    };

    callCliWithCustomArgsBeforeAll(['unexpected-command'], context, true);

    stderrContainsMessages(context, ['Unexpected argument', '--help']);
});
