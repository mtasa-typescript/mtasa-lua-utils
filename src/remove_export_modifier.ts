import * as ts from 'typescript';
import { generateGlobalExpression } from './global_export';

type ResultType = ts.Node | ts.Node[] | undefined;

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

  return [node, generateGlobalExpression(name, ctx.factory, true)];
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

  return [node, generateGlobalExpression(name, ctx.factory, true)];
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
  for (const declaration of node.declarationList.declarations) {
    const name = declaration.name?.getText() || '___undefined';

    names.push(name);
  }

  const globalExpressions: ts.Node[] = [];
  for (const name of names) {
    globalExpressions.push(generateGlobalExpression(name, ctx.factory, true));
  }
  return [node, ...globalExpressions];
}

export default function removeExportModifierIfPossible(node: ts.Node, ctx: ts.TransformationContext): ResultType {
  const chain: ((n: ts.Node, c: ts.TransformationContext) => ResultType)[] = [
    removeFunctionExportModifier,
    removeClassExportModifier,
    removeVariableExportModifier,
  ];
  for (const f of chain) {
    const result = f(node, ctx);
    if (result) {
      return result;
    }
  }

  return undefined;
}
