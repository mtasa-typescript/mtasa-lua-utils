import {
    callCompilerWithMetaPathBeforeAll,
    CompilerProcessContext,
    stderrEmptyTest,
    targetDirectoryFilesLengthTest,
    targetFileCheckTest,
} from '../../mixins';
import * as path from 'path';
import * as fs from 'fs';

describe('Case "withFile"', () => {
    const targetPath = 'src/tests/dist/withFile';

    const context: CompilerProcessContext = {
        processOut: '',
        processErr: '',
    };

    callCompilerWithMetaPathBeforeAll(
        'src/tests/resources.spec/withFile/mtasa-meta.yml',
        context,
        false,
    );

    stderrEmptyTest(context);

    targetFileCheckTest(targetPath, true);
    targetFileCheckTest(path.join(targetPath, 'lualib_bundle.lua'), false);
    targetFileCheckTest(path.join(targetPath, 'meta.xml'), true);
    targetFileCheckTest(path.join(targetPath, 'files/image.png'), true);
    targetFileCheckTest(path.join(targetPath, 'files/not-tracked.png'), false);

    targetDirectoryFilesLengthTest(targetPath, 2);

    test('The target file "meta.xml" does not contain unexpected tags', () => {
        const content = fs.readFileSync(
            path.join(targetPath, 'meta.xml'),
            'utf8',
        );
        expect(content).not.toContain('<script');
    });

    test('The target file "meta.xml" contains expected tags', () => {
        const content = fs.readFileSync(
            path.join(targetPath, 'meta.xml'),
            'utf8',
        );
        expect(content).toContain('<oop');
        expect(content).toContain('<file');
    });
});
