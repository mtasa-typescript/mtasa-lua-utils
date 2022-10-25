import { FunctionVisitor } from 'typescript-to-lua/dist/transformation/context/visitors';
import * as ts from 'typescript';
import { transformExportDeclaration } from 'typescript-to-lua/dist/transformation/visitors/modules/export';
import { getGlobalsTableName, prepareOneToManyVisitorResult } from './utils';
import {
    AssignmentStatement,
    Identifier,
    Plugin,
    SyntaxKind,
    TableIndexExpression,
} from 'typescript-to-lua';

const removeExportDeclaration: FunctionVisitor<ts.ExportDeclaration> =
    function (node, context) {
        const rawResult = transformExportDeclaration(node, context);
        const result = prepareOneToManyVisitorResult(rawResult);

        for (const statement of result) {
            if (statement.kind !== SyntaxKind.AssignmentStatement) {
                continue;
            }

            const assignment = statement as AssignmentStatement;
            if (assignment.left.length === 0) {
                continue;
            }
            if (assignment.left[0].kind !== SyntaxKind.TableIndexExpression) {
                continue;
            }

            const expression = assignment.left[0] as TableIndexExpression;
            if (expression.table.kind !== SyntaxKind.Identifier) {
                continue;
            }

            const tableIdentifier = expression.table as Identifier;
            if (tableIdentifier.text.indexOf('exports') === -1) {
                continue;
            }
            tableIdentifier.text = getGlobalsTableName();
        }

        // result[0].
        return result;
    };

export default {
    visitors: {
        [ts.SyntaxKind.ExportDeclaration]: removeExportDeclaration,
    },
} as Plugin;
