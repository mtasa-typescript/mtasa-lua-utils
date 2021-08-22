import { FunctionVisitor } from 'typescript-to-lua/dist/transformation/context/visitors';
import * as ts from 'typescript';
import {
    createIdentifier,
    createVariableDeclarationStatement,
    Plugin,
} from 'typescript-to-lua';
import { getIdentifierSymbolId } from 'typescript-to-lua/dist/transformation/utils/symbols';

interface ImportSpecifierToGlobalTable {
    namePattern: RegExp;
    modulePattern: RegExp;
}

// TODO: make configurable
const importSpecifiersMapToGlobalTable: ImportSpecifierToGlobalTable[] = [
    {
        namePattern: /^mtasa$/,
        modulePattern: /^mtasa-lua-types\/types\/mtasa\/(client|server)$/,
    },
];

const prepareGlobalImports: FunctionVisitor<ts.ImportDeclaration> = function (
    node,
    context,
) {
    const importClause = node.importClause;
    if (importClause?.namedBindings === undefined) {
        return context.superTransformStatements(node);
    }

    if (importClause.namedBindings.kind === ts.SyntaxKind.NamespaceImport) {
        return context.superTransformStatements(node);
    }

    const namedImports = importClause.namedBindings;
    if (node.moduleSpecifier.kind !== ts.SyntaxKind.StringLiteral) {
        return [];
    }
    const moduleSpecifier = node.moduleSpecifier as ts.StringLiteral;
    const module = moduleSpecifier.text;
    const specifiers: ImportSpecifierToGlobalTable[] =
        importSpecifiersMapToGlobalTable.filter(value =>
            module.match(value.modulePattern),
        );

    if (specifiers.length === 0) {
        return namedImports.elements
            .filter(value => !!value.propertyName)
            .map(value =>
                createVariableDeclarationStatement(
                    createIdentifier(
                        value.name.text,
                        value.name,
                        getIdentifierSymbolId(context, value.name),
                    ),
                    createIdentifier(value.propertyName?.text ?? 'nil'),
                    value,
                ),
            );
    }
    const specifier = specifiers[0];

    return namedImports.elements
        .filter(value =>
            (value.propertyName ?? value.name).text.match(
                specifier.namePattern,
            ),
        )
        .map(value =>
            createVariableDeclarationStatement(
                createIdentifier(
                    value.name.text,
                    value.name,
                    getIdentifierSymbolId(context, value.name),
                ),
                createIdentifier('_G'),
                value,
            ),
        );
};

export default {
    visitors: {
        [ts.SyntaxKind.ImportDeclaration]: prepareGlobalImports,
    },
} as Plugin;
