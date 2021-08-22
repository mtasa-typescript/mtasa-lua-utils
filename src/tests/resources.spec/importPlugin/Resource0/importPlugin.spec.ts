import {
    callCompilerWithMetaPathBeforeAll,
    CompilerProcessContext,
    stderrEmptyTest,
    targetDirectoryFilesLengthTest,
    targetFileCheckTest,
} from '../../../mixins';
import * as path from 'path';
import * as fs from 'fs';

describe('Case "importPlugin", Resource0', () => {
    const targetPath = 'dist/tests/resources.spec/importPlugin/Resource0';

    const context: CompilerProcessContext = {
        processOut: '',
        processErr: '',
    };

    callCompilerWithMetaPathBeforeAll(
        'src/tests/resources.spec/importPlugin/mtasa-meta.yml',
        context,
    );

    stderrEmptyTest(context);

    targetFileCheckTest(targetPath, true);
    targetFileCheckTest(path.join(targetPath, 'lualib_bundle.lua'), true);
    targetFileCheckTest(path.join(targetPath, 'index.lua'), true);
    targetFileCheckTest(path.join(targetPath, 'imported.lua'), true);
    targetFileCheckTest(path.join(targetPath, 'meta.xml'), true);

    test('The target file "meta.xml" does not contain unexpected tags', () => {
        const content = fs.readFileSync(
            path.join(targetPath, 'meta.xml'),
            'utf8',
        );
        expect(content).not.toContain('<file');
    });

    test('The target file "index.lua" content', () => {
        const content = fs.readFileSync(
            path.join(targetPath, 'index.lua'),
            'utf8',
        );
        expect(content).not.toContain('____exports');
        expect(content).not.toContain('require(');

        expect(content).toContain('mtasaNew = _G');
        expect(content).toContain('impFunction()');
        expect(content).toContain('mtasaNew.iprint');
        expect(content).toContain('impFunction = importedFunction');
    });

    test('The target file "imported.lua" content', () => {
        const content = fs.readFileSync(
            path.join(targetPath, 'imported.lua'),
            'utf8',
        );
        expect(content).not.toContain('____exports');
        expect(content).not.toContain('require(');

        expect(content).toContain('__TS__SourceMapTraceBack');
        expect(content).toContain('function _G.importedFunction()');
        expect(content).toContain('"Hello, Resource 0"');
    });

    test('The target file "meta.xml" contains expected tags', () => {
        const content = fs.readFileSync(
            path.join(targetPath, 'meta.xml'),
            'utf8',
        );
        expect(content).toContain('<oop');
        expect(content).toContain('<script');
        expect(content).toContain('src="imported.lua"');
        expect(content).toContain('src="index.lua"');
    });
});
