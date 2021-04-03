import * as ts from 'typescript';
import {isImportNode} from './anti_import'
import {fileSideDetection, ImportTypesSide} from './script_side_detection'
import {exportToGlobal} from "./global_export";
import removeExportModifierIfPossible from "./remove_export_modifier";


export default function (_program: ts.Program, _pluginOptions: {}) {
    return (ctx: ts.TransformationContext) => {
        return (sourceFile: ts.SourceFile) => {
            const props: {
                side: ImportTypesSide | undefined
            } = {
                side: undefined,
            };

            const visitor = (node: ts.Node): (ts.Node | ts.Node[] | undefined) => {
                // Attempt to detect script side (and to restrict sides mixing)
                fileSideDetection(node, props);

                // Remove imports => remove lua 'requires'
                if (isImportNode(node)) {
                    return undefined;
                }

                // Exported functions/classes/variables
                // will be explicitly set as a property of _G
                let exportReplace = exportToGlobal(node, ctx)
                if (exportReplace) {
                    if (typeof exportReplace == 'object') {
                        exportReplace = exportReplace as ts.Node[];
                        return [node, ...exportReplace];
                    } else {
                        exportReplace = exportReplace as ts.Node;
                        return [node, exportReplace];
                    }
                }

                // Attempt to remove `export` modifier and add `_G` prop
                // Used for inlined `export`, e.g. `export function ...`
                const removedModifier = removeExportModifierIfPossible(node, ctx);
                if (removedModifier) {
                    return removedModifier;
                }

                return ts.visitEachChild(node, visitor, ctx);
            }

            return ts.visitEachChild(sourceFile, visitor, ctx);
        };
    };
}