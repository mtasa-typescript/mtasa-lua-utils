import { FunctionVisitor } from 'typescript-to-lua/dist/transformation/context/visitors';
import * as ts from 'typescript';
import { Plugin, TransformationContext } from 'typescript-to-lua';
import { CompilerOptions } from '../compiler/cli';
import * as path from 'path';
import { Script } from '../compiler/meta/types';
import { simpleTsDiagnostic } from '../compiler/utils';

export function isRelativeImport(moduleName: string): boolean {
    return moduleName.startsWith('../') || moduleName.startsWith('./');
}

export function getFileSide(
    filepath: string,
    context: TransformationContext,
): Script['type'] | undefined {
    const options = context.options as CompilerOptions;
    const rootDir = options.rootDir as string;

    const scripts = options.resourceSpecific?.scripts?.filter(
        script => path.join(rootDir, script.src) === path.join(filepath),
    );

    if (scripts === undefined || scripts.length === 0) {
        return undefined;
    }

    return scripts[0].type;
}

const checkImportsSide: FunctionVisitor<ts.ImportDeclaration> = function (
    node,
    context,
) {
    const moduleSpecifier = node.moduleSpecifier;
    if (moduleSpecifier.kind !== ts.SyntaxKind.StringLiteral) {
        return context.superTransformStatements(node);
    }

    const module = moduleSpecifier as ts.StringLiteral;
    const moduleName = module.text;

    const currentFileType = getFileSide(context.sourceFile.fileName, context);
    if (!currentFileType) {
        return context.superTransformStatements(node);
    }

    if (isRelativeImport(moduleName)) {
        let importedFileType = getFileSide(
            path.join(
                path.dirname(context.sourceFile.fileName),
                moduleName + '.ts',
            ),
            context,
        );

        if (!importedFileType || importedFileType === 'shared') {
            importedFileType = currentFileType;
        }

        if (importedFileType !== currentFileType) {
            context.diagnostics.push(
                simpleTsDiagnostic(
                    `Do not use ${importedFileType}-side imports in ${currentFileType}-side script ` +
                        `\n(file: ${context.sourceFile.fileName})`,
                    ts.DiagnosticCategory.Warning,
                ),
            );
            return context.superTransformStatements(node);
        }
    } else {
        // Check mtasa-lua-types side
        if (moduleName.startsWith('mtasa-lua-types')) {
            if (
                currentFileType === 'client' &&
                moduleName.indexOf('server') !== -1
            ) {
                context.diagnostics.push(
                    simpleTsDiagnostic(
                        `Do not use server-side imports in client-side script ` +
                            `\n(file: ${context.sourceFile.fileName})`,
                        ts.DiagnosticCategory.Warning,
                    ),
                );
                return context.superTransformStatements(node);
            }
            if (
                currentFileType === 'server' &&
                moduleName.indexOf('client') !== -1
            ) {
                context.diagnostics.push(
                    simpleTsDiagnostic(
                        `Do not use client-side imports in server-side script ` +
                            `\n(file: ${context.sourceFile.fileName})`,
                        ts.DiagnosticCategory.Warning,
                    ),
                );
                return context.superTransformStatements(node);
            }
            if (
                currentFileType === 'shared' &&
                (moduleName.indexOf('client') !== -1 ||
                    moduleName.indexOf('server') !== -1)
            ) {
                context.diagnostics.push(
                    simpleTsDiagnostic(
                        `Do not use client-side or server-side imports` +
                            `in shared-side script ` +
                            `\n(file: ${context.sourceFile.fileName})`,
                        ts.DiagnosticCategory.Warning,
                    ),
                );
                return context.superTransformStatements(node);
            }
        }
    }

    return context.superTransformStatements(node);
};

export default {
    visitors: {
        [ts.SyntaxKind.ImportDeclaration]: checkImportsSide,
    },
} as Plugin;
