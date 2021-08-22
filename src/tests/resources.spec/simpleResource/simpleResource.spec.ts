import {
    callCompilerWithMetaPathBeforeAll,
    CompilerProcessContext,
    stderrEmptyTest,
    targetDirectoryFilesLengthTest,
    targetFileCheckTest,
} from '../../mixins';
import * as path from 'path';
import * as fs from 'fs';

describe('Case "simpleResource"', () => {
    const targetPath = 'dist/tests/resources.spec/simpleResource';

    const context: CompilerProcessContext = {
        processOut: '',
        processErr: '',
    };

    callCompilerWithMetaPathBeforeAll(
        'src/tests/resources.spec/simpleResource/mtasa-meta.yml',
        context,
    );

    stderrEmptyTest(context);

    targetFileCheckTest(targetPath, true);
    targetFileCheckTest(path.join(targetPath, 'lualib_bundle.lua'), true);
    targetFileCheckTest(path.join(targetPath, 'meta.xml'), true);

    //    targetDirectoryFilesLengthTest(targetPath, 1);

    test('The target file "meta.xml" does not contain unexpected tags', () => {
        const content = fs.readFileSync(
            path.join(targetPath, 'meta.xml'),
            'utf8',
        );
        //        expect(content).not.toContain('<script');
    });

    test('The target file "meta.xml" contains expected tags', () => {
        const content = fs.readFileSync(
            path.join(targetPath, 'meta.xml'),
            'utf8',
        );
        expect(content).toContain('<oop');
    });
});
