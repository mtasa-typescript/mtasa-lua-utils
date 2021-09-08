import {
    callCompilerWithMetaPathBeforeAll,
    CompilerProcessContext,
    stdoutContainsMessages,
    targetFileCheckTest,
} from '../../mixins';
import * as path from 'path';

describe('Case "notExistingScriptInMeta"', () => {
    const targetPath = 'src/tests/dist/notExistingScriptInMeta';

    const context: CompilerProcessContext = {
        processOut: '',
        processErr: '',
    };

    callCompilerWithMetaPathBeforeAll(
        'src/tests/resources.spec/notExistingScriptInMeta/mtasa-meta.yml',
        context,
        true,
    );

    stdoutContainsMessages(context, ['error', 'not found']);

    targetFileCheckTest(targetPath, true);
    targetFileCheckTest(path.join(targetPath, 'meta.xml'), false);
});
