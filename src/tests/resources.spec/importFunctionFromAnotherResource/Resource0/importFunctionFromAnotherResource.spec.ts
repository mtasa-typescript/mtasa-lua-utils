import {
    callCompilerWithMetaPathBeforeAll,
    CompilerProcessContext,
    stderrEmptyTest,
    stdoutContainsMessages,
    targetDirectoryFilesLengthTest,
    targetFileCheckTest,
} from '../../../mixins';
import * as path from 'path';
import * as fs from 'fs';

describe('Case "importFunctionFromAnotherResource", Resource0', () => {
    const targetPath =
        'src/tests/dist/importFunctionFromAnotherResource/Resource0';

    const context: CompilerProcessContext = {
        processOut: '',
        processErr: '',
    };

    callCompilerWithMetaPathBeforeAll(
        'src/tests/resources.spec/importFunctionFromAnotherResource/mtasa-meta.yml',
        context,
        false,
    );

    stderrEmptyTest(context);

    targetFileCheckTest(targetPath, true);
    targetFileCheckTest(path.join(targetPath, 'lualib_bundle.lua'), true);
    targetFileCheckTest(path.join(targetPath, 'indexWithExports.lua'), true);
    targetFileCheckTest(path.join(targetPath, 'meta.xml'), true);

    targetDirectoryFilesLengthTest(targetPath, 5);

    test('The target file "meta.xml" contains expected tags', () => {
        const content = fs.readFileSync(
            path.join(targetPath, 'meta.xml'),
            'utf8',
        );
        expect(content).toContain('<oop');
        expect(content).toContain('<script');
        expect(content).toContain('src="indexWithExports.lua"');
        expect(content).toContain('<export');
        expect(content).toContain('function="anotherResourceFunction"');
    });
});
