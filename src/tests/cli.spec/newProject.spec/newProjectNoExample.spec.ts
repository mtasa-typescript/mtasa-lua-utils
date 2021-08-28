import {
    callCliWithCustomArgsBeforeAll,
    CompilerProcessContext,
    stderrEmptyTest,
    targetFileCheckTest,
} from '../../mixins';
import { getStdinContentForNewProjectCommandNoExample } from '../../cliUtils';
import path from 'path';
import fs from 'fs';

describe('New Project CLI command (no example resource)', () => {
    const targetPath = 'src/tests/dist/[MyProjectNoExample]';

    const context: CompilerProcessContext = {
        processOut: '',
        processErr: '',
    };

    callCliWithCustomArgsBeforeAll(
        ['new-project', '--branch', 'develop'],
        context,
        false,
        {
            executable: '../../../dist/cli.js',
            stdinContent: [
                ...getStdinContentForNewProjectCommandNoExample(
                    'MyProjectNoExample',
                ),
            ],
            cwd: 'src/tests/dist',
        },
    );

    stderrEmptyTest(context);

    targetFileCheckTest(targetPath, true);
    targetFileCheckTest(path.join(targetPath, '.idea'), false);
    targetFileCheckTest(path.join(targetPath, '.vscode'), true);
    targetFileCheckTest(path.join(targetPath, 'tsconfig.json'), true);
    targetFileCheckTest(path.join(targetPath, 'mtasa-meta.yml'), true);
    targetFileCheckTest(path.join(targetPath, 'src/TypeScriptResource'), false);

    test('The target file "mtasa-meta.yml" does not contain resource info', () => {
        const content = fs.readFileSync(
            path.join(targetPath, 'mtasa-meta.yml'),
            'utf8',
        );
        expect(content).not.toContain(`srcDir: TypeScriptResource`);
        expect(content).not.toContain(`name: TypeScriptResource`);
    });
});
