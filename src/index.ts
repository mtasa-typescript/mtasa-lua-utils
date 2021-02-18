import * as ts from 'typescript';
import {isImportNode} from './anti_import'
import {fileSideDetection, ImportTypesSide} from './script_side_detection'


export default function (_program: ts.Program, _pluginOptions: {}) {
    return (ctx: ts.TransformationContext) => {
        return (sourceFile: ts.SourceFile) => {
            const props: {
                side: ImportTypesSide | undefined
            } = {
                side: undefined,
            };

            const visitor = (node: ts.Node): ts.Node | undefined => {
                // Remove all exports
                // However, file without export and without import remains as a module
                if (ts.isExportDeclaration(node)) {
                    // return undefined;
                }

                // Attempt to detect script side (and to restrict sides mixing)
                fileSideDetection(node, props);

                // Remove imports => remove lua 'requires'
                if (isImportNode(node)) {
                    return undefined;
                }

                return ts.visitEachChild(node, visitor, ctx);
            }

            // if (ts.isExternalModule(sourceFile)) {
            //     (sourceFile as any).externalModuleIndicator = undefined
            // }

            return ts.visitEachChild(sourceFile, visitor, ctx);
        };
    };
}