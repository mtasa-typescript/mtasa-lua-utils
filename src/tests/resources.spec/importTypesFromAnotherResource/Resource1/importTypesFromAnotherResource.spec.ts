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

describe('Case "importTypesFromAnotherResource", Resource1', () => {
    const targetPath =
        'src/tests/dist/importTypesFromAnotherResource/Resource1';

    const context: CompilerProcessContext = {
        processOut: '',
        processErr: '',
    };

    callCompilerWithMetaPathBeforeAll(
        'src/tests/resources.spec/importTypesFromAnotherResource/mtasa-meta.yml',
        context,
        false,
    );

    stderrEmptyTest(context);

    targetFileCheckTest(targetPath, true);
    targetFileCheckTest(path.join(targetPath, 'lualib_bundle.lua'), true);
    targetFileCheckTest(path.join(targetPath, 'index.lua'), true);
    targetFileCheckTest(path.join(targetPath, 'meta.xml'), true);

    targetDirectoryFilesLengthTest(targetPath, 5);

    test('The target file "index.lua" contains strings', () => {
        const content = fs.readFileSync(
            path.join(targetPath, 'index.lua'),
            'utf8',
        );
        expect(content).toContain('object = ');
        expect(content).toContain('mtasa.iprint(object)');
    });

    test('The target file "meta.xml" contains expected tags', () => {
        const content = fs.readFileSync(
            path.join(targetPath, 'meta.xml'),
            'utf8',
        );
        expect(content).toContain('<oop');
        expect(content).toContain('<script');
    });
});
