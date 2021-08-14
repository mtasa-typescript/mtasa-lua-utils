import * as tstl from 'typescript-to-lua';
import {
    Identifier,
    SyntaxKind,
    TableIndexExpression,
    VariableDeclarationStatement
} from "typescript-to-lua";
import * as ts from 'typescript';
import {
    FunctionVisitor,
    Visitor,
} from 'typescript-to-lua/dist/transformation/context/visitors';
import { transformFunctionDeclaration } from 'typescript-to-lua/dist/transformation/visitors/function';
import { getExportsTableName, getGlobalsTableName, prepareOneToManyVisitorResult } from "./utils";
import { Expression } from 'typescript-to-lua/dist/LuaAST';

const importDeclarationVisitor: Visitor<ts.ImportDeclaration> = function (
    node,
    context,
) {
    return [];
};

const functionDeclaration: FunctionVisitor<ts.FunctionDeclaration> = function (
    node,
    context,
) {
    const rawResult = transformFunctionDeclaration(node, context);
    const result = prepareOneToManyVisitorResult(rawResult);

    if (result === undefined) {
        return result;
    }

    for (const statement of result) {
        if (statement.kind !== SyntaxKind.AssignmentStatement) {
            continue;
        }

        const declaration = statement as VariableDeclarationStatement;
        const left: Expression[] = declaration.left
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

    // const a:AssignmentStatement;

    return result;
};

export default {
    // `visitors` is a record where keys are TypeScript node syntax kinds
    visitors: {
        // Visitor can be a function that returns Lua AST node
        [ts.SyntaxKind.ImportDeclaration]: importDeclarationVisitor,
        [ts.SyntaxKind.FunctionDeclaration]: functionDeclaration,
    },
} as tstl.Plugin;
