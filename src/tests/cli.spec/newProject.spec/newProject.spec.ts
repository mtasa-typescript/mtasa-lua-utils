import {
    callCliWithCustomArgsBeforeAll,
    CompilerProcessContext,
    stderrEmptyTest,
    stdoutContainsMessages,
    targetFileCheckTest,
} from '../../mixins';
import { getStdinContentForNewProjectCommand } from "../../cliUtils";
import path from 'path';
import fs from 'fs';

describe('New Project CLI command', () => {
    const targetPath = 'src/tests/dist/[MyProject]';

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
                ...getStdinContentForNewProjectCommand('MyProject')
            ],
            cwd: 'src/tests/dist',
        },
    );

    stderrEmptyTest(context);
    stdoutContainsMessages(context, [
        'Enter the project name',
        'project name into square brackets',
        '[MyProject]',
        'Select features',
        'npm install -D',
        'Directory will be created',
        'Download complete',
        'Filled the directory',
        'Features setup complete',
        'Node Modules prepared',
        'has been created',
        'mtasa-lua-utils new-resource',
        'mtasa-lua-utils build',
    ]);

    targetFileCheckTest(targetPath, true);
    targetFileCheckTest(path.join(targetPath, '.idea'), false);
    targetFileCheckTest(path.join(targetPath, '.github'), false);
    targetFileCheckTest(path.join(targetPath, '.vscode'), true);
    targetFileCheckTest(path.join(targetPath, 'tsconfig.json'), true);
    targetFileCheckTest(path.join(targetPath, 'mtasa-meta.yml'), true);
    targetFileCheckTest(path.join(targetPath, 'src/TypeScriptResource'), true);

    test('The target file "package.json" contains project name', () => {
        const content = fs.readFileSync(
            path.join(targetPath, 'package.json'),
            'utf8',
        );
        expect(content).toContain(`"name": "my-project"`);
    });

    test('The target file "mtasa-meta.yml" contains resource info', () => {
        const content = fs.readFileSync(
            path.join(targetPath, 'mtasa-meta.yml'),
            'utf8',
        );
        expect(content).toContain(`srcDir: TypeScriptResource`);
        expect(content).toContain(`name: TypeScriptResource`);
    });
});
