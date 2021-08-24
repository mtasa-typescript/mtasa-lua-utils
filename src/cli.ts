#!/usr/bin/env node

import ts from 'typescript';
import { boilerplateEntrypoint } from './cli/boilerplate';
import { buildProject } from './cli/build';

const ERROR_MESSAGE =
    'Expected usage: mtasa-lua-utils [command]\n' +
    '    Available commands: boilerplate, build';

function parseAndExecuteArguments(): void {
    if (ts.sys.args.length !== 2) {
        console.error(ERROR_MESSAGE);
        ts.sys.exit(1);
    }
    if (ts.sys.args[1] === 'boilerplate') {
        boilerplateEntrypoint()
            .then(() =>
                console.log('MTASA Boilerplate has been set up successfully'),
            )
            .catch();
        return;
    }
    if (ts.sys.args[1] === 'build') {
        buildProject();
        return;
    }

    console.error(ERROR_MESSAGE);
    ts.sys.exit(1);
}

parseAndExecuteArguments();
