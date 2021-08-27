import {
    callCliWithCustomArgsBeforeAll,
    CompilerProcessContext,
    stderrEmptyTest,
    stdoutContainsMessages,
    targetFileCheckTest,
} from '../../mixins';
import { CLI_ENQUIRER_KEY } from '../../cliUtil';
import path from 'path';
import fs from 'fs';

describe('New Resource CLI command', () => {
    const targetPath = 'src/tests/dist/[NewResource]';

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
                'NewResource',
                CLI_ENQUIRER_KEY.ENTER,
                CLI_ENQUIRER_KEY.ENTER,
            ],
            cwd: 'src/tests/dist',
        },
    );

    callCliWithCustomArgsBeforeAll(['new-resource'], context, false, {
        executable: '../../../../dist/cli.js',
        stdinContent: [
            'NewResource',
            CLI_ENQUIRER_KEY.ENTER,
            CLI_ENQUIRER_KEY.ENTER,
            CLI_ENQUIRER_KEY.ENTER,
        ],
        cwd: 'src/tests/dist/[NewResource]',
    });

    stderrEmptyTest(context);
    stdoutContainsMessages(context, ['Enter the resource name']);

    targetFileCheckTest(targetPath, true);
    targetFileCheckTest(
        path.join(targetPath, 'src/NewResource/server.ts'),
        true,
    );
    targetFileCheckTest(
        path.join(targetPath, 'src/NewResource/client.ts'),
        true,
    );
    targetFileCheckTest(
        path.join(targetPath, 'src/NewResource/utils.ts'),
        true,
    );
    targetFileCheckTest(path.join(targetPath, 'mtasa-meta.yml'), true);

    test('The target file "mtasa-meta.yml" contains new resource data', () => {
        const content = fs.readFileSync(
            path.join(targetPath, 'mtasa-meta.yml'),
            'utf8',
        );
        expect(content).toContain('---');
        expect(content).toContain('name: NewResource');
        expect(content).toContain('src: server.ts');
        expect(content).toContain('src: client.ts');
        expect(content).toContain('src: utils.ts');
        expect(content).toContain('srcDir: NewResource');
    });
});
