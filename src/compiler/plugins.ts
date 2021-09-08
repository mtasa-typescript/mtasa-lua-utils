import { LuaPluginImport } from 'typescript-to-lua/dist/CompilerOptions';
import path from 'path';

export function getPluginPath(pluginLocalPath: string): string {
    return path.join(__dirname, '../../dist/ast', pluginLocalPath);
}

const plugins: LuaPluginImport[] = [
    {
        name: getPluginPath('removeImports.js'),
    },
    {
        name: getPluginPath('prepareImports.js'),
    },
    {
        name: getPluginPath('validateImports.js'),
    },
    {
        name: getPluginPath('removeExportAssignment.js'),
    },
    {
        name: getPluginPath('removeExportDeclaration.js'),
    },
    {
        name: getPluginPath('removeFileExports.js'),
    },
    {
        name: getPluginPath('removeInlinedExport.js'),
    },
];

const pluginsBundle: LuaPluginImport[] = [
    {
        name: getPluginPath('prepareImports.js'),
    },
];

export function getPlugins(isBundleCompile: boolean): LuaPluginImport[] {
    if (isBundleCompile) {
        return pluginsBundle;
    }

    return plugins;
}
