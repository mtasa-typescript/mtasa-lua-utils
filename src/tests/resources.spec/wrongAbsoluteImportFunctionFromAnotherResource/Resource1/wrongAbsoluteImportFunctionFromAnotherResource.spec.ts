import {
    callCompilerWithMetaPathBeforeAll,
    CompilerProcessContext,
    stdoutContainsMessages,
    targetFileCheckTest,
} from '../../../mixins';

describe('Case "wrongAbsoluteImportFunctionFromAnotherResource", Resource1', () => {
    const targetPath =
        'src/tests/dist/wrongAbsoluteImportFunctionFromAnotherResource/Resource1';

    const context: CompilerProcessContext = {
        processOut: '',
        processErr: '',
    };

    callCompilerWithMetaPathBeforeAll(
        'src/tests/resources.spec/wrongAbsoluteImportFunctionFromAnotherResource/mtasa-meta.yml',
        context,
        true,
    );

    stdoutContainsMessages(context, [
        'cannot import function',
        'from another resource',
    ]);

    targetFileCheckTest(targetPath, true);
});
