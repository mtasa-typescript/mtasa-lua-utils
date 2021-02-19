import * as ts from 'typescript';
import {isImportNode} from './anti_import'
import {fileSideDetection, ImportTypesSide} from './script_side_detection'
import {exportToGlobal, generateGlobalExpression} from "./global_export";


export default function (_program: ts.Program, _pluginOptions: {}) {
    return (ctx: ts.TransformationContext) => {
        return (sourceFile: ts.SourceFile) => {
            const props: {
                side: ImportTypesSide | undefined
            } = {
                side: undefined,
            };

            let inlinedExports: string[] = []

            let pivotExpression: ts.Node | undefined = undefined;

            const visitor = (node: ts.Node): ts.Node | ts.Node[] | undefined => {
                // Remove all exports
                // However, file without export and without import remains as a module
                if (ts.isExportDeclaration(node)) {
                    return exportToGlobal(node, ctx.factory);
                }

                // TODO: убрать все это и запретить inline export
                if (ts.isFunctionDeclaration(node)) {
                    const modifiers =
                        node.modifiers?.filter((v: ts.Modifier) => v.kind !== ts.SyntaxKind.ExportKeyword)
                    const r = ctx.factory.createFunctionDeclaration(
                        node.decorators,
                        modifiers,
                        node.asteriskToken,
                        node.name,
                        node.typeParameters,
                        node.parameters,
                        node.type,
                        node.body
                    )
                    return r;
                }

                // not covered by "export declaration" => That's an inline
                if (ts.isToken(node) && node.kind === ts.SyntaxKind.ExportKeyword) {
                    const parent = node.parent
                    if (ts.isClassDeclaration(parent)
                        || ts.isVariableDeclaration(parent)
                        || ts.isFunctionDeclaration(parent)) {

                        const name = parent.name?.getText();
                        if (name) {
                            inlinedExports.push(name)
                        }

                    } else if (ts.isVariableStatement(parent)) {
                        for (const declaration of parent.declarationList.declarations) {
                            const name = declaration.name?.getText();
                            if (name) {
                                inlinedExports.push(name)
                            }
                        }
                    }


                    return undefined;   // skip inlined "exports" keyword
                }

                // Attempt to detect script side (and to restrict sides mixing)
                fileSideDetection(node, props);

                // Remove imports => remove lua 'requires'
                if (isImportNode(node)) {
                    return undefined;
                }

                // Set pivot for inline "export"s
                if (node.parent === sourceFile) {
                    pivotExpression = node;
                }

                return ts.visitEachChild(node, visitor, ctx);
            }

            // This visitor inserts all inlined exports after the last child of the file
            const endOfFileVisitor = (node: ts.Node): ts.Node | ts.Node[] | undefined => {
                if (node.pos !== pivotExpression?.pos) {
                    return node;
                }

                const antiInlineNodes: ts.Node[] = []
                for (let name of inlinedExports) {
                    antiInlineNodes.push(
                        generateGlobalExpression(name, ctx.factory)
                    );
                }
                inlinedExports = [];

                return [node, ...antiInlineNodes];
            }

            let result = ts.visitEachChild(sourceFile, visitor, ctx);
            if (inlinedExports.length !== 0 && !pivotExpression) {
                throw new Error('Not all exports has been transformed. ' +
                    'Please beware inlined exports like "export class ..." and use "export {...};" in the ' +
                    sourceFile.fileName + ' file');
            }

            if (inlinedExports.length !== 0) {
                result = ts.visitEachChild(result, endOfFileVisitor, ctx);
            }
            return result;
        };
    };
}