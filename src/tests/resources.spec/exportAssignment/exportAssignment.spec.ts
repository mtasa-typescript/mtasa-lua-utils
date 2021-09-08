import {
    callCompilerWithMetaPathBeforeAll,
    CompilerProcessContext,
    stdoutContainsMessages,
    targetFileCheckTest,
} from '../../mixins';

describe('Case "exportAssignment", Resource3', () => {
    const targetPath = 'src/tests/dist/exportAssignment';

    const context: CompilerProcessContext = {
        processOut: '',
        processErr: '',
    };

    callCompilerWithMetaPathBeforeAll(
        'src/tests/resources.spec/exportAssignment/mtasa-meta.yml',
        context,
        true,
    );

    stdoutContainsMessages(context, [
        'warning',
        'Do not use export assignments',
    ]);

    targetFileCheckTest(targetPath, true);
});
