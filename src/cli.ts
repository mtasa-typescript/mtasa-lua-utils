#!/usr/bin/env node

import ts from 'typescript';
import { newProjectEntrypoint } from './cli/newProject';
import { buildProject } from './cli/build';
import { getVersion } from './cli/information';
import { newResourceEntrypoint } from './cli/newResource';

const HELP_MESSAGE =
    `mtasa-lua-utils version: ${getVersion()}\n` +
    '\x1b[0m\n' +
    'Usage: \x1b[35mmtasa-lua-utils \x1b[1m<command>\x1b[0m\n' +
    '\x1b[0m\n' +
    'Available commands:' +
    '\x1b[0m\n' +
    '    \x1b[34mnew-project    \x1b[0mInitialize MTASA TypeScript Boilerplate' +
    '\x1b[0m\n' +
    '    \x1b[34mnew-resource   \x1b[0mCreate new resource inside MTASA TypeScript Project' +
    '\x1b[0m\n' +
    '    \x1b[34mbuild          \x1b[0mBuild TypeScript Resource' +
    '\x1b[0m\n' +
    '\x1b[0m\n' +
    'Example command, to get more specific help:\n' +
    '\x1b[35mmtasa-lua-utils \x1b[1mbuild \x1b[34m--help\x1b[0m';

const ERROR_MESSAGE =
    'Unexpected argument. Use command below to get information:\n' +
    '\x1b[34mmtasa-lua-utils --help\x1b[0m';

function parseAndExecuteArguments(): void {
    if (ts.sys.args.length === 0) {
        console.error(ERROR_MESSAGE);
        ts.sys.exit(1);
    }
    if (ts.sys.args[0] === 'new-project') {
        newProjectEntrypoint(ts.sys.args.slice(1))
            .then(() => null)
            .catch(err => {
                console.error(err);
            });
        return;
    }
    if (ts.sys.args[0] === 'new-resource') {
        newResourceEntrypoint(ts.sys.args.slice(1))
            .then(() =>
                console.log(
                    '\x1b[32mNew TypeScript resource has been set up successfully\x1b[0m',
                ),
            )
            .catch(err => {
                console.error(err);
            });
        return;
    }
    if (ts.sys.args[0] === 'build') {
        buildProject(ts.sys.args.slice(1));
        return;
    }
    if (
        ts.sys.args[0] === '--help' ||
        ts.sys.args[0] === '?' ||
        ts.sys.args[0] === '-h'
    ) {
        console.error(HELP_MESSAGE);
        return;
    }

    console.error(ERROR_MESSAGE);
    ts.sys.exit(1);
}

parseAndExecuteArguments();
