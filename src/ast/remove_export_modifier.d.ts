/** @noSelfInFile */
import * as ts from 'typescript';
declare type ResultType = ts.Node | ts.Node[] | undefined;
export default function removeExportModifierIfPossible(node: ts.Node, ctx: ts.TransformationContext): ResultType;
export {};
