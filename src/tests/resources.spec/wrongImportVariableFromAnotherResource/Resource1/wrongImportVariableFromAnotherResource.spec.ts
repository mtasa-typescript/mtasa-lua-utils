import {
    callCompilerWithMetaPathBeforeAll,
    CompilerProcessContext,
    stdoutContainsMessages,
    targetFileCheckTest,
} from '../../../mixins';
import * as path from 'path';
import * as fs from 'fs';

describe('Case "wrongImportVariableFromAnotherResource", Resource1', () => {
    const targetPath =
        'src/tests/dist/wrongImportVariableFromAnotherResource/Resource1';

    const context: CompilerProcessContext = {
        processOut: '',
        processErr: '',
    };

    callCompilerWithMetaPathBeforeAll(
        'src/tests/resources.spec/wrongImportVariableFromAnotherResource/mtasa-meta.yml',
        context,
        true,
    );

    stdoutContainsMessages(context, ['error', 'cannot import variable']);

    targetFileCheckTest(targetPath, true);
    targetFileCheckTest(path.join(targetPath, 'lualib_bundle.lua'), true);
    targetFileCheckTest(path.join(targetPath, 'meta.xml'), false);
});
