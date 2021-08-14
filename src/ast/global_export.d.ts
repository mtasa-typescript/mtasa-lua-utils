/** @noSelfInFile */
import * as ts from 'typescript';
declare type ResultType = ts.Node | ts.Node[] | undefined;
export declare function generateGlobalExpression(name: string, factory: ts.NodeFactory, fromExportedScope?: boolean): ts.Node;
export declare function exportDeclarationToGlobal(node: ts.Node, ctx: ts.TransformationContext): ResultType;
export declare function exportAssignmentToGlobal(node: ts.Node, ctx: ts.TransformationContext): ResultType;
export declare function exportToGlobal(node: ts.Node, ctx: ts.TransformationContext): ts.Node | ts.Node[] | undefined;
export {};
