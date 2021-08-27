import { FunctionVisitor } from 'typescript-to-lua/dist/transformation/context/visitors';
import * as ts from 'typescript';
import {
    createIdentifier,
    createVariableDeclarationStatement,
    Plugin,
    Statement,
    TransformationContext,
} from 'typescript-to-lua';
import { getIdentifierSymbolId } from 'typescript-to-lua/dist/transformation/utils/symbols';
import {
    getFileSide,
    getGlobalsTableName,
    getImportNodeModuleFile,
    getResourceDirectoryName,
    isLocalImport,
} from './utils';
import * as path from 'path';
import { CompilerOptions } from '../compiler/cli';
import { simpleTsDiagnostic } from '../compiler/utils';

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

function resolveImportsFromAnotherModules(
    node: Readonly<ts.ImportDeclaration>,
    context: TransformationContext,
): Statement[] {
    if (node.moduleSpecifier.kind !== ts.SyntaxKind.StringLiteral) {
        return [];
    }
    if (!isLocalImport(node, context)) {
        return [];
    }

    const moduleFullPath = path.resolve(
        getImportNodeModuleFile(node, context).fileName,
    );
    const options = context.options as CompilerOptions;

    const targetResources = options.metaList?.filter(meta =>
        moduleFullPath.startsWith(
            path.join(
                options.originalRootDir ?? '',
                meta.compilerConfig.srcDir,
            ),
        ),
    );
    if (!targetResources || targetResources.length === 0) {
        context.diagnostics.push(
            simpleTsDiagnostic(
                `Do not import something not from the resource` +
                    `\n(file: ${context.sourceFile.fileName})` +
                    `\n(import: ${moduleFullPath})`,
                ts.DiagnosticCategory.Warning,
            ),
        );
        return [];
    }
    const targetResource = targetResources[0];
    const isSameResource =
        targetResource.compilerConfig.srcDir ===
        options.resourceSpecific?.compilerConfig.srcDir;
    if (isSameResource) {
        return [];
    }
    const typeChecker = context.program.getTypeChecker();

    if (node.importClause?.namedBindings === undefined) {
        return context.superTransformStatements(node);
    }
    if (
        node.importClause.namedBindings.kind === ts.SyntaxKind.NamespaceImport
    ) {
        return context.superTransformStatements(node);
    }
    const namedBindings = node.importClause.namedBindings;
    const importedSymbols = namedBindings.elements
        .map(value => typeChecker.getTypeAtLocation(value).symbol)
        .filter(value => value !== undefined);

    const result: Statement[] = [];
    for (const symbol of importedSymbols) {
        if (!symbol.declarations || symbol.declarations.length === 0) {
            continue;
        }
        const declaration = symbol.valueDeclaration;
        if (!declaration) {
            continue;
        }

        if (
            ts.isInterfaceDeclaration(declaration) ||
            ts.isEnumDeclaration(declaration)
        ) {
            continue;
        }

        if (ts.isFunctionDeclaration(declaration)) {
            const currentSide = getFileSide(
                context.sourceFile.fileName,
                context,
            );
            const declarationName = declaration.name;
            if (!declarationName) {
                continue;
            }
            const availableExports = targetResource.exports?.filter(
                value =>
                    value.type === currentSide &&
                    value.function === declaration.name?.text,
            );

            if (!availableExports || availableExports.length === 0) {
                context.diagnostics.push(
                    simpleTsDiagnostic(
                        `You cannot import function from another resource, ` +
                            `if it is not listed in the exports section` +
                            `\n(file: ${context.sourceFile.fileName})` +
                            `\n(import: ${moduleFullPath})`,
                        ts.DiagnosticCategory.Error,
                    ),
                );
            } else {
                const resourceName = getResourceDirectoryName(targetResource);
                result.push(
                    createVariableDeclarationStatement(
                        createIdentifier(
                            declarationName.text,
                            declarationName,
                            getIdentifierSymbolId(context, declarationName),
                        ),
                        createIdentifier(
                            `function(...) return exports["${resourceName}"]:${declarationName.text}(...) end`,
                        ),
                        declarationName,
                    ),
                );
            }
        }

        if (
            ts.isClassDeclaration(declaration) ||
            ts.isVariableDeclaration(declaration)
        ) {
            context.diagnostics.push(
                simpleTsDiagnostic(
                    `You cannot import variable or class from another resource` +
                        `\n(file: ${context.sourceFile.fileName})` +
                        `\n(import: ${moduleFullPath})`,
                    ts.DiagnosticCategory.Error,
                ),
            );
        }
    }

    return result;
}

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
        return [
            ...resolveImportsFromAnotherModules(node, context),
            ...namedImports.elements
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
                ),
        ];
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
                createIdentifier(getGlobalsTableName()),
                value,
            ),
        );
};

export default {
    visitors: {
        [ts.SyntaxKind.ImportDeclaration]: prepareGlobalImports,
    },
} as Plugin;
