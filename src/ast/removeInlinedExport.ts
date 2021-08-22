import * as ts from 'typescript';
import {
    Identifier,
    Plugin,
    Statement,
    SyntaxKind,
    TableIndexExpression,
    VariableDeclarationStatement,
} from 'typescript-to-lua';
import {
    getExportsTableName,
    getGlobalsTableName,
    prepareOneToManyVisitorResult,
} from './utils';
import { Expression } from 'typescript-to-lua/dist/LuaAST';
import { FunctionVisitor } from 'typescript-to-lua/dist/transformation/context/visitors';
import { transformFunctionDeclaration } from 'typescript-to-lua/dist/transformation/visitors/function';
import { transformVariableStatement } from 'typescript-to-lua/dist/transformation/visitors/variable-declaration';
import { transformClassDeclaration } from 'typescript-to-lua/dist/transformation/visitors/class';

function statementListAntiExport(
    statements: Statement[] | Statement | undefined,
): Statement[] {
    const result = prepareOneToManyVisitorResult(statements);

    for (const statement of result) {
        if (statement.kind !== SyntaxKind.AssignmentStatement) {
            continue;
        }

        const declaration = statement as VariableDeclarationStatement;
        const left: Expression[] = declaration.left;
        if (left[0].kind !== SyntaxKind.TableIndexExpression) {
            continue;
        }

        const expression = left[0] as TableIndexExpression;
        if (expression.table.kind !== SyntaxKind.Identifier) {
            continue;
        }

        const tableIdentifier = expression.table as Identifier;
        if (tableIdentifier.text !== getExportsTableName()) {
            continue;
        }

        tableIdentifier.text = getGlobalsTableName();
    }

    return result;
}

const functionDeclarationAntiExport: FunctionVisitor<ts.FunctionDeclaration> =
    function (node, context) {
        const rawResult = context.superTransformStatements(node);
        return statementListAntiExport(rawResult);
    };

const variableStatementAntiExport: FunctionVisitor<ts.VariableStatement> =
    function (node, context) {
        const rawResult = context.superTransformStatements(node);
        return statementListAntiExport(rawResult);
    };

const classDeclarationAntiExport: FunctionVisitor<ts.ClassDeclaration> =
    function (node, context) {
        const rawResult = context.superTransformStatements(node);
        return statementListAntiExport(rawResult);
    };

export default {
    visitors: {
        [ts.SyntaxKind.FunctionDeclaration]: functionDeclarationAntiExport,
        [ts.SyntaxKind.VariableStatement]: variableStatementAntiExport,
        [ts.SyntaxKind.ClassDeclaration]: classDeclarationAntiExport,
    },
} as Plugin;
