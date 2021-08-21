import { FunctionVisitor } from 'typescript-to-lua/dist/transformation/context/visitors';
import * as ts from 'typescript';
import {
    createIdentifier,
    createVariableDeclarationStatement,
    Plugin,
} from 'typescript-to-lua';
import { getIdentifierSymbolId } from 'typescript-to-lua/dist/transformation/utils/symbols';


const removeImportDeclarations: FunctionVisitor<ts.ImportDeclaration> =
    function (node, context) {
        const importClause = node.importClause;
        if (importClause?.namedBindings === undefined) {
          return [];
        }

        if (importClause.namedBindings.kind !== ts.SyntaxKind.NamespaceImport) {
          return context.superTransformStatements(node);
        }

        const namespaceImport = importClause.namedBindings;
        const name = namespaceImport.name.text;

        return [
            createVariableDeclarationStatement(
                createIdentifier(
                    name,
                    namespaceImport.name,
                    getIdentifierSymbolId(context, namespaceImport.name),
                ),
                createIdentifier('_G'),
                node,
            ),
        ];
    };

export default {
    visitors: {
        [ts.SyntaxKind.ImportDeclaration]: removeImportDeclarations,
    },
} as Plugin;
