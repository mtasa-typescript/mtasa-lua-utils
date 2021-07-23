import ts from "typescript";

export function isImportNode(node: ts.Node): boolean {
	return !!ts.isImportDeclaration(node);
}
