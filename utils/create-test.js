// eslint-disable-next-line @typescript-eslint/no-var-requires
const enquirer = require('enquirer');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs');

/**
 * @return {Promise<void>}
 */
function promptTestData() {
    return enquirer.prompt([
        {
            type: 'input',
            name: 'directory',
            message: 'Test directory name:',
        },
        {
            type: 'numeral',
            name: 'resourceAmount',
            message: 'Resources amount (in mtasa-meta.yml file):',
            initial: 1,
            validate(value) {
                if (isNaN(+value) || +value <= 0) {
                    return 'Amount of resources should be a positive number';
                }
                return true;
            },
        },
        {
            type: 'toggle',
            name: 'containsLuaLib',
            message:
                'Does the generated directory contains lualib_bundle.lua file?',
            enabled: 'Yes',
            disabled: 'No',
            initial: 1,
        },
        {
            type: 'toggle',
            name: 'containsMeta',
            message: 'Does the generated directory contains meta.yml?',
            enabled: 'Yes',
            disabled: 'No',
            initial: 1,
        },
        {
            type: 'toggle',
            name: 'successful',
            message: 'Does the compiler exit successfully?',
            enabled: 'Yes',
            disabled: 'No',
            initial: 1,
        },
    ]);
}

function getSpecContent(name, innerId, lualib, meta, successful) {
    const targetDirectory = `src/tests/dist/${name}${
        innerId === undefined ? '' : '/Resource' + innerId
    }`;
    const srcDirectory = `src/tests/resources.spec/${name}`;

    return `import {
    callCompilerWithMetaPathBeforeAll,
    CompilerProcessContext,
    stderrEmptyTest,
    stdoutContainsMessages,
    targetDirectoryFilesLengthTest,
    targetFileCheckTest,
} from '${innerId === undefined ? '' : '../'}../../mixins';
import * as path from 'path';
import * as fs from 'fs';

describe('Case "${name}"${
        innerId === undefined ? '' : ', Resource' + innerId
    }', () => {
    const targetPath = '${targetDirectory}';

    const context: CompilerProcessContext = {
        processOut: '',
        processErr: ''
    };

    callCompilerWithMetaPathBeforeAll(
        '${srcDirectory}/mtasa-meta.yml',
        context,
        ${!successful}
    );

    ${
        successful
            ? 'stderrEmptyTest(context);'
            : 'stdoutContainsMessages(context, [\n\n    ]);'
    }

    targetFileCheckTest(targetPath, true);
    targetFileCheckTest(path.join(targetPath, 'lualib_bundle.lua'), ${!!lualib});
    targetFileCheckTest(path.join(targetPath, 'meta.xml'), ${!!meta});

//    targetDirectoryFilesLengthTest(targetPath, 1);

    test('The target file "meta.xml" does not contain unexpected tags', () => {
        const content = fs.readFileSync(
            path.join(targetPath, 'meta.xml'),
            'utf8',
        );
//        expect(content).not.toContain('<script');
    });

    test('The target file "meta.xml" contains expected tags', () => {
        const content = fs.readFileSync(
            path.join(targetPath, 'meta.xml'),
            'utf8',
        );
        expect(content).toContain('<oop');
    });
});
`;
}

promptTestData()
    .then(data => {
        const rootPath = 'src/tests/resources.spec';
        const srcPath = '';

        const rootDirectory = path.join(rootPath, data.directory);
        const srcDirectory = path.join(srcPath, data.directory);

        const resourceAmount = data.resourceAmount;
        fs.mkdirSync(rootDirectory, { recursive: true });
        let mtasaMetaYml = `info:
    type: script

compilerConfig:
    srcDir: ${srcDirectory}
`;

        if (resourceAmount > 1) {
            for (let i = 0; i < resourceAmount; ++i) {
                const localDirectory = path.join(rootDirectory, `Resource${i}`);
                fs.mkdirSync(localDirectory, {
                    recursive: true,
                });
                fs.writeFileSync(
                    path.join(localDirectory, `${data.directory}.spec.ts`),
                    getSpecContent(
                        data.directory,
                        i,
                        data.containsLuaLib,
                        data.containsMeta,
                        data.successful,
                    ),
                );

                if (i === 0) {
                    mtasaMetaYml = '';
                } else {
                    mtasaMetaYml += '\n---\n\n';
                }

                mtasaMetaYml += `info:
    name: Resource${i}
    type: script

compilerConfig:
    srcDir: ${srcDirectory}/Resource${i}
`;
            }
        } else {
            fs.writeFileSync(
                path.join(rootDirectory, `${data.directory}.spec.ts`),
                getSpecContent(
                    data.directory,
                    undefined,
                    data.containsLuaLib,
                    data.containsMeta,
                    data.successful,
                ),
            );
        }

        fs.writeFileSync(
            path.join(rootDirectory, 'mtasa-meta.yml'),
            mtasaMetaYml,
            'utf8',
        );
    })
    .catch(err => console.error(err));
