import * as ts from 'typescript';

enum ImportTypesSide {
    CLIENT = 'CLIENT',
    SERVER = 'SERVER',
}

function shouldNodeBeRemoved(node: ts.Node): boolean {
    return !!ts.isImportDeclaration(node);
}

function fileSideDetection(node: ts.Node, props: { side: ImportTypesSide | undefined }) {
    if (!ts.isImportDeclaration(node)) {
        return;
    }

    node.forEachChild(childNode => {
        if (!ts.isStringLiteral(childNode)) {
            return;
        }

        const filepath = childNode.getText().toLowerCase();
        if (filepath.indexOf('client') !== -1) {
            if (props.side === undefined) {
                props.side = ImportTypesSide.CLIENT
                return;
            } else if (props.side === ImportTypesSide.SERVER) {
                throw new Error('Please do not mix client and server side imports')
            }
            return;
        }

        if (filepath.indexOf('server') !== -1) {
            if (props.side === undefined) {
                props.side = ImportTypesSide.SERVER
                return;
            } else if (props.side === ImportTypesSide.CLIENT) {
                throw new Error('Please do not mix client and server side imports')
            }
            return;
        }
    })
}

export default function (_program: ts.Program, _pluginOptions: {}) {
    return (ctx: ts.TransformationContext) => {
        return (sourceFile: ts.SourceFile) => {
            const props: {
                side: ImportTypesSide | undefined
            } = {
                side: undefined,
            };

            const visitor = (node: ts.Node): ts.Node | undefined => {

                // Attempt to detect script side
                fileSideDetection(node, props);

                // Remove imports => remove lua 'requires'
                if (shouldNodeBeRemoved(node)) {
                    return undefined;
                }

                return ts.visitEachChild(node, visitor, ctx);
            }

            return ts.visitEachChild(sourceFile, visitor, ctx);
        };
    };
}