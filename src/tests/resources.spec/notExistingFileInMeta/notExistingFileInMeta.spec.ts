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

describe('Case "notExistingFileInMeta"', () => {
    const targetPath = 'src/tests/dist/notExistingFileInMeta';

    const context: CompilerProcessContext = {
        processOut: '',
        processErr: '',
    };

    callCompilerWithMetaPathBeforeAll(
        'src/tests/resources.spec/notExistingFileInMeta/mtasa-meta.yml',
        context,
        true,
    );

    stdoutContainsMessages(context, []);

    targetFileCheckTest(targetPath, true);
    targetFileCheckTest(path.join(targetPath, 'lualib_bundle.lua'), false);
    targetFileCheckTest(path.join(targetPath, 'file/not-existing.png'), false);
    targetFileCheckTest(path.join(targetPath, 'meta.xml'), false);

    //    targetDirectoryFilesLengthTest(targetPath, 1);
});
