import { CompilerOptions } from './cli';
import { Diagnostic, DiagnosticCategory } from 'typescript';
import { simpleTsDiagnostic } from './utils';

type ValidatorFunction = (options: Readonly<CompilerOptions>) => Diagnostic[];

const validateLuaTarget: ValidatorFunction = function (options) {
    if (options.luaTarget === '5.1') {
        return [];
    }

    return [
        simpleTsDiagnostic(
            'Expected Lua Target version is 5.1. ' +
                'Check the tsconfig.json\n' +
                'https://github.com/mtasa-typescript/mtasa-lua-utils/blob/master/tsconfig.json',
            DiagnosticCategory.Warning,
        ),
    ];
};

const validateLuaLibImport: ValidatorFunction = function (options) {
    if (options.luaLibImport === 'always') {
        return [];
    }

    return [
        simpleTsDiagnostic(
            'Expected luaLibImport property value: "always". ' +
                'Check the tsconfig.json\n' +
                'https://github.com/mtasa-typescript/mtasa-lua-utils/blob/master/tsconfig.json',
            DiagnosticCategory.Warning,
        ),
    ];
};

export function validateOptions(
    options: Readonly<CompilerOptions>,
): Diagnostic[] {
    return [...validateLuaTarget(options), ...validateLuaLibImport(options)];
}
