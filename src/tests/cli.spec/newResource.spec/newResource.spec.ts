import { targetFileCheckTest } from '../../mixins';
import path from 'path';
import fs from 'fs';
import {
    CLI_EXECUTING_TIMEOUT,
    ConsoleSpyType,
    prepareDefaultCliTest,
    prepareProjectEnvironment,
} from '../mixins';
import { newResource } from '../../../cli/newResource';

describe('New Resource CLI command', () => {
    const context: {
        consoleSpy: ConsoleSpyType;
    } = {
        consoleSpy: undefined as unknown as ConsoleSpyType, // lazyinit
    };
    const targetPath = 'src/tests/dist/[NewResource]';
    prepareDefaultCliTest(context, targetPath);
    prepareProjectEnvironment(targetPath);

    beforeAll(() => {
        fs.writeFileSync(
            path.join(targetPath, 'mtasa-meta.yml'),
            'info:\n    type: script',
            'utf8',
        );
    });

    beforeAll(async () => {
        await newResource(targetPath, {
            resourceName: 'NewResource',
        });
    }, CLI_EXECUTING_TIMEOUT);

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
