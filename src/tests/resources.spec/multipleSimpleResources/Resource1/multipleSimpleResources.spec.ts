import {
    callCompilerWithMetaPathBeforeAll,
    CompilerProcessContext,
    stderrEmptyTest,
    targetDirectoryFilesLengthTest,
    targetFileCheckTest,
} from '../../../mixins';
import * as path from 'path';
import * as fs from 'fs';

describe('Case "multipleSimpleResources", Resource1', () => {
    const targetPath = 'src/tests/dist/multipleSimpleResources/Resource1';

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
    targetFileCheckTest(path.join(targetPath, 'lualib_bundle.lua'), true);
    targetFileCheckTest(path.join(targetPath, 'meta.xml'), true);

    targetDirectoryFilesLengthTest(targetPath, 5);

    test('The target file "meta.xml" does not contain unexpected tags', () => {
        const content = fs.readFileSync(
            path.join(targetPath, 'meta.xml'),
            'utf8',
        );
        expect(content).not.toContain('<min_mta_version');
    });

    test('The target file "meta.xml" contains expected tags', () => {
        const content = fs.readFileSync(
            path.join(targetPath, 'meta.xml'),
            'utf8',
        );
        expect(content).toContain('<oop');
        expect(content).toContain('<script');
        expect(content).toContain('<setting ');
        expect(content).toContain('cache="false"');
    });
});
