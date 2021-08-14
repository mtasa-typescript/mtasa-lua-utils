/** @noSelfInFile */
import * as ts from 'typescript';
export default function (_program: ts.Program, _pluginOptions: {
    externalImports?: boolean;
    globalExports?: boolean;
}): (ctx: ts.TransformationContext) => (sourceFile: ts.SourceFile) => ts.SourceFile;
