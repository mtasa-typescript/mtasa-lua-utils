import * as ts from 'typescript';
import { DiagnosticCategory } from 'typescript';
import { Plugin } from 'typescript-to-lua';
import { FunctionVisitor } from 'typescript-to-lua/dist/transformation/context/visitors';
import { simpleTsDiagnostic } from '../compiler/utils';
import { transformExportAssignment } from 'typescript-to-lua/dist/transformation/visitors/modules/export';

const removeExportAssignment: FunctionVisitor<ts.ExportAssignment> = function (
    node,
    context,
) {
    context.diagnostics.push(
        simpleTsDiagnostic(
            `Do not use export assignments (file: ${context.sourceFile.fileName})`,
            DiagnosticCategory.Warning,
        ),
    );
    return transformExportAssignment(node, context);
};

export default {
    visitors: {
        [ts.SyntaxKind.ExportAssignment]: removeExportAssignment,
    },
} as Plugin;
