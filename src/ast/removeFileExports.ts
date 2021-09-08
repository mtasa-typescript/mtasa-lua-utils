import * as ts from 'typescript';
import {
    Identifier,
    Plugin,
    ReturnStatement,
    SyntaxKind,
    TransformationContext,
    VariableDeclarationStatement,
} from 'typescript-to-lua';
import { FunctionVisitor } from 'typescript-to-lua/dist/transformation/context/visitors';
import { transformSourceFileNode } from 'typescript-to-lua/dist/transformation/visitors/sourceFile';

const sourceFileRemoveExports: FunctionVisitor<ts.SourceFile> = function (
    node,
    context: TransformationContext,
) {
    const result = transformSourceFileNode(node, context);

    result.statements = result.statements.filter(statement => {
        if (statement.kind === SyntaxKind.VariableDeclarationStatement) {
            const declaration = statement as VariableDeclarationStatement;
            return !(
                declaration.left.length > 0 &&
                declaration.left[0].kind === SyntaxKind.Identifier &&
                declaration.left[0].text.indexOf('exports') !== -1
            );
        }
        if (statement.kind === SyntaxKind.ReturnStatement) {
            const declaration = statement as ReturnStatement;
            return !(
                declaration.expressions.length > 0 &&
                declaration.expressions[0].kind === SyntaxKind.Identifier &&
                (declaration.expressions[0] as Identifier).text.indexOf(
                    'exports',
                ) !== -1
            );
        }

        return true;
    });
    return result;
};

export default {
    visitors: {
        [ts.SyntaxKind.SourceFile]: sourceFileRemoveExports,
    },
} as Plugin;
