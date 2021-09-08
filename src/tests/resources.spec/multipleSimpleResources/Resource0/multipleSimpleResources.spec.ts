import {
    callCompilerWithMetaPathBeforeAll,
    CompilerProcessContext,
    stderrEmptyTest,
    targetDirectoryFilesLengthTest,
    targetFileCheckTest,
} from '../../../mixins';
import * as path from 'path';
import * as fs from 'fs';

describe('Case "multipleSimpleResources", Resource0', () => {
    const targetPath = 'src/tests/dist/multipleSimpleResources/Resource0';

    const context: CompilerProcessContext = {
        processOut: '',
        processErr: '',
    };

    callCompilerWithMetaPathBeforeAll(
        'src/tests/resources.spec/multipleSimpleResources/mtasa-meta.yml',
        context,
        false,
    );

    stderrEmptyTest(context);

    targetFileCheckTest(targetPath, true);
    targetFileCheckTest(path.join(targetPath, 'lualib_bundle.lua'), false);
    targetFileCheckTest(path.join(targetPath, 'meta.xml'), true);

    targetDirectoryFilesLengthTest(targetPath, 1);

    test('The target file "meta.xml" does not contain unexpected tags', () => {
        const content = fs.readFileSync(
            path.join(targetPath, 'meta.xml'),
            'utf8',
        );
        expect(content).not.toContain('<script');
        expect(content).not.toContain('<right');
        expect(content).not.toContain('<export');
        expect(content).not.toContain('<setting ');
    });

    test('The target file "meta.xml" contains expected tags', () => {
        const content = fs.readFileSync(
            path.join(targetPath, 'meta.xml'),
            'utf8',
        );
        expect(content).toContain('<min_mta_version');
        expect(content).toContain('client="1.5.8"');
        expect(content).toContain('server="1.5.8"');
        expect(content).toContain('<oop');
    });
});
