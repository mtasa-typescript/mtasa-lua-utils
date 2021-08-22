import {
    callCompilerWithMetaPathBeforeAll,
    CompilerProcessContext,
    targetFileCheckTest,
} from '../../mixins';

describe('Case "exportAssignment", Resource3', () => {
    const targetPath = 'dist/tests/resources.spec/exportAssignment';

    const context: CompilerProcessContext = {
        processOut: '',
        processErr: '',
    };

    callCompilerWithMetaPathBeforeAll(
        'src/tests/resources.spec/exportAssignment/mtasa-meta.yml',
        context,
        true,
    );

    test('Stdout contains error message', () => {
        expect(context.processOut).toContain('warning');
        expect(context.processOut).toContain('Do not use export assignments');
    });

    targetFileCheckTest(targetPath, true);
});
