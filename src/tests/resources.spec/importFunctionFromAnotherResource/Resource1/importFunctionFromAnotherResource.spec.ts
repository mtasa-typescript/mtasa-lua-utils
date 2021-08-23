import {
    callCompilerWithMetaPathBeforeAll,
    CompilerProcessContext,
    stderrEmptyTest,
    targetDirectoryFilesLengthTest,
    targetFileCheckTest,
} from '../../../mixins';
import * as path from 'path';
import * as fs from 'fs';

describe('Case "importFunctionFromAnotherResource", Resource1', () => {
    const targetPath =
        'src/tests/dist/importFunctionFromAnotherResource/Resource1';

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
    targetFileCheckTest(path.join(targetPath, 'imported.lua'), true);
    targetFileCheckTest(path.join(targetPath, 'index.lua'), true);
    targetFileCheckTest(path.join(targetPath, 'meta.xml'), true);

    targetDirectoryFilesLengthTest(targetPath, 8);

    test('The target file "meta.xml" contains expected tags', () => {
        const content = fs.readFileSync(
            path.join(targetPath, 'meta.xml'),
            'utf8',
        );
        expect(content).toContain('<oop');
        expect(content).toContain('<script');
    });

    test('The target file "index.lua" contains expected tags', () => {
        const content = fs.readFileSync(
            path.join(targetPath, 'index.lua'),
            'utf8',
        );
        expect(content).toContain(
            'function(...) return exports["Resource0"]:anotherResourceFunction(...) end',
        );
        expect(content).toContain('anotherResourceFunction()');
        expect(content).toContain('exportedTheSameResource()');
    });
});
