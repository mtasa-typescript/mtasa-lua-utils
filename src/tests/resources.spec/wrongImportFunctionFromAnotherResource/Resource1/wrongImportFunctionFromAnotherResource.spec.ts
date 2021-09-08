import {
    callCompilerWithMetaPathBeforeAll,
    CompilerProcessContext,
    stdoutContainsMessages,
    targetFileCheckTest,
} from '../../../mixins';
import * as path from 'path';

describe('Case "wrongImportFunctionFromAnotherResource", Resource1', () => {
    const targetPath =
        'src/tests/dist/wrongImportFunctionFromAnotherResource/Resource1';

    const context: CompilerProcessContext = {
        processOut: '',
        processErr: '',
    };

    callCompilerWithMetaPathBeforeAll(
        'src/tests/resources.spec/wrongImportFunctionFromAnotherResource/mtasa-meta.yml',
        context,
        true,
    );

    stdoutContainsMessages(context, ['error', 'cannot import function']);

    targetFileCheckTest(targetPath, true);
    targetFileCheckTest(path.join(targetPath, 'lualib_bundle.lua'), true);
    targetFileCheckTest(path.join(targetPath, 'meta.xml'), false);
});
