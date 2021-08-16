import { LuaPluginImport } from 'typescript-to-lua/dist/CompilerOptions';
import path from 'path';

export function getPluginPath(pluginLocalPath: string): string {
    return path.join(__dirname, '../../dist/ast', pluginLocalPath);
}

const plugins: LuaPluginImport[] = [
    {
        name: getPluginPath('examplePlugin.js'),
    },
];

const pluginsBundle: LuaPluginImport[] = [];

export function getPlugins(isBundleCompile: boolean): LuaPluginImport[] {
    if (isBundleCompile) {
        return pluginsBundle;
    }

    return plugins;
}
