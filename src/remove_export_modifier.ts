import * as ts from 'typescript';
import {generateGlobalExpression} from "./global_export";

type ResultType = ts.Node | ts.Node[] | undefined;

function filterModifiers(modifiers: ts.ModifiersArray | undefined): ts.Modifier[] {
    if (!modifiers) {
        return [];
    }

    return modifiers
        .filter((v: ts.Modifier) => v.kind !== ts.SyntaxKind.ExportKeyword);
}

/**
 *  `export function something() {}` will be converted to
 *  `local function something() end; _G.something = something`
 */
function removeFunctionExportModifier(node: ts.Node, ctx: ts.TransformationContext): ResultType {
    if (!ts.isFunctionDeclaration(node)) {
        return undefined;
    }
    if (!(ts.getCombinedModifierFlags(node) & ts.ModifierFlags.Export)) {
        return undefined;
    }

    const name = node.name?.getText() || '___undefined';
    const newFunction = ctx.factory.updateFunctionDeclaration(
        node,
        node.decorators,
        filterModifiers(node.modifiers),
        node.asteriskToken,
        ctx.factory.createIdentifier(name),
        node.typeParameters,
        node.parameters,
        node.type,
        node.body
    );

    return [newFunction, generateGlobalExpression(name, ctx.factory)];
}

/**
 * `export class ETestC { }` will be converted to
 * `local ETestC = __TS__Class(); ...; _G.ETestC = ETestC`
 */
function removeClassExportModifier(node: ts.Node, ctx: ts.TransformationContext): ResultType {
    if (!ts.isClassDeclaration(node)) {
        return undefined;
    }
    if (!(ts.getCombinedModifierFlags(node) & ts.ModifierFlags.Export)) {
        return undefined;
    }

    const name = node.name?.getText() || '___undefined';
    const newClass = ctx.factory.updateClassDeclaration(
        node,
        node.decorators,
        filterModifiers(node.modifiers),
        ctx.factory.createIdentifier(name),
        node.typeParameters,
        node.heritageClauses,
        node.members,
    )

    return [newClass, generateGlobalExpression(name, ctx.factory)];
}

/**
 * `export let ETestLet: number = 54, ETestLet2: number = 13;` will be converted to
 * `local ETestLet = 54; local ETestLet2 = 13; _G.ETestLet = ETestLet; _G.ETestLet2 = ETestLet2`
 */
function removeVariableExportModifier(node: ts.Node, ctx: ts.TransformationContext): ResultType {
    if (!ts.isVariableStatement(node)) {
        return undefined;
    }
    if (!(ts.getCombinedModifierFlags(node as any) & ts.ModifierFlags.Export)) {
        return undefined;
    }

    const names: string[] = [];
    const newDeclarations: ts.VariableDeclaration[] = []
    for (const declaration of node.declarationList.declarations) {
        const name = declaration.name?.getText() || '___undefined'
        const newDeclaration = ctx.factory.updateVariableDeclaration(
            declaration,
            ctx.factory.createIdentifier(name),
            declaration.exclamationToken,
            declaration.type,
            declaration.initializer,
        );

        names.push(name);
        newDeclarations.push(newDeclaration);
    }

    const newDeclarationList = ctx.factory.updateVariableDeclarationList(
        node.declarationList,
        newDeclarations
    )

    const newVariable = ctx.factory.updateVariableStatement(
        node,
        filterModifiers(node.modifiers),
        newDeclarationList,
    )

    const globalExpressions: ts.Node[] = [];
    for (const name of names) {
        globalExpressions.push(
            generateGlobalExpression(name, ctx.factory)
        );
    }
    return [newVariable, ...globalExpressions];
}

export default function removeExportModifierIfPossible(node: ts.Node, ctx: ts.TransformationContext): ResultType {
    const chain: ((n: ts.Node, c: ts.TransformationContext) => ResultType)[] = [
        removeFunctionExportModifier,
        removeClassExportModifier,
        removeVariableExportModifier,
    ]
    for (const f of chain) {
        const result = f(node, ctx);
        if (result) {
            return result;
        }
    }

    return undefined;
}