import * as ts from 'typescript';

// Copy-pasted from
// https://github.com/oscard0m/ts-transformer-remove-named-export/blob/main/src/transform.ts

const isBlacklistedIdentifier = (): boolean => {
    return true;
};

const isExportDeclaration = (node: ts.Declaration): boolean => {
    return !!(ts.getCombinedModifierFlags(node) & ts.ModifierFlags.Export);
};

const hasBlacklistedExportDeclaration = (node: ts.VariableStatement): boolean => {
    return node.declarationList.declarations.some((declaration: ts.VariableDeclaration): boolean => {
        return isExportDeclaration(declaration) &&
            isBlacklistedIdentifier();
    });
};

export const isBlacklistedNamedExportVariable = (node: ts.Node): boolean => {
    return ts.isVariableStatement(node) &&
        hasBlacklistedExportDeclaration(node);
};

const isNamedExportFunction = (node: ts.Node): boolean => {
    return ts.isFunctionDeclaration(node) &&
        isExportDeclaration(node);
};

export const isBlacklistedNamedExportFunction = (node: ts.Node): boolean => {
    return isNamedExportFunction(node) &&
        isBlacklistedIdentifier();
};

export const isBlacklistedExportStatement = (node: ts.Node): boolean => {
    return ts.isExportSpecifier(node) &&
        isBlacklistedIdentifier();
};