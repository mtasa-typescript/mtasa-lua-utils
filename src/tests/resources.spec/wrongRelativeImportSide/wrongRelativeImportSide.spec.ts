import {
    callCompilerWithMetaPathBeforeAll,
    CompilerProcessContext,
    stderrEmptyTest,
    stdoutContainsMessages,
    targetDirectoryFilesLengthTest,
    targetFileCheckTest,
} from '../../mixins';
import * as path from 'path';
import * as fs from 'fs';

describe('Case "wrongRelativeImportSide"', () => {
    const targetPath = 'src/tests/dist/wrongRelativeImportSide';

    const context: CompilerProcessContext = {
        processOut: '',
        processErr: '',
    };

    callCompilerWithMetaPathBeforeAll(
        'src/tests/resources.spec/wrongRelativeImportSide/mtasa-meta.yml',
        context,
        true,
    );

    stdoutContainsMessages(context, ['error']);

    targetFileCheckTest(targetPath, true);
    targetFileCheckTest(path.join(targetPath, 'meta.xml'), false);
});
