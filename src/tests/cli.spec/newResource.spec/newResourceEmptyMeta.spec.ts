import {
    callCliWithCustomArgsBeforeAll,
    CompilerProcessContext,
    stderrEmptyTest,
    targetFileCheckTest,
} from '../../mixins';
import {
    CLI_ENQUIRER_KEY,
    getStdinContentForNewProjectCommandNoExample,
} from '../../cliUtils';
import path from 'path';
import fs from 'fs';

describe('New Resource CLI command (empty meta)', () => {
    const targetPath = 'src/tests/dist/[NewResourceEmptyMeta]';

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
                    'NewResourceEmptyMeta',
                ),
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
        cwd: targetPath,
    });

    targetFileCheckTest(targetPath, true);
    targetFileCheckTest(path.join(targetPath, 'mtasa-meta.yml'), true);

    test('The target file "mtasa-meta.yml" contains new resource data', () => {
        const content = fs.readFileSync(
            path.join(targetPath, 'mtasa-meta.yml'),
            'utf8',
        );
        expect(content).not.toContain('---');
        expect(content).toContain('name: NewResource');
        expect(content).toContain('srcDir: NewResource');
    });
});
