import {
    callCompilerWithMetaPathBeforeAll,
    CompilerProcessContext,
    stdoutContainsMessages,
    targetDirectoryFilesLengthTest,
    targetFileCheckTest,
} from '../../mixins';
import * as path from 'path';
import * as fs from 'fs';

describe('Case "wrongImportSide"', () => {
    const targetPath = 'src/tests/dist/wrongImportSide';

    const context: CompilerProcessContext = {
        processOut: '',
        processErr: '',
    };

    callCompilerWithMetaPathBeforeAll(
        'src/tests/resources.spec/wrongImportSide/mtasa-meta.yml',
        context,
        true,
    );

    stdoutContainsMessages(context, ['warning', 'client-side', 'server-side']);

    targetFileCheckTest(targetPath, true);
    targetFileCheckTest(path.join(targetPath, 'meta.xml'), false);
});
