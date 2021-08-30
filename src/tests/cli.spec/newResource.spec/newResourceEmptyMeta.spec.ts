import path from 'path';
import fs from 'fs';
import {
    CLI_EXECUTING_TIMEOUT,
    ConsoleSpyType,
    prepareDefaultCliTest,
    prepareProjectEnvironment,
} from '../mixins';
import { newResource } from '../../../cli/newResource';

describe('New Resource CLI command (empty meta)', () => {
    const context: {
        consoleSpy: ConsoleSpyType;
    } = {
        consoleSpy: undefined as unknown as ConsoleSpyType, // lazyinit
    };
    const targetPath = 'src/tests/dist/[NewResourceEmptyMeta]';
    prepareDefaultCliTest(context, targetPath);
    prepareProjectEnvironment(targetPath);

    beforeAll(async () => {
        await newResource(targetPath, {
            resourceName: 'NewResourceEmptyMeta',
        });
    }, CLI_EXECUTING_TIMEOUT);

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
