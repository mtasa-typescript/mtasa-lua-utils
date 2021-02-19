import * as ts from 'typescript';

export function generateGlobalExpression(name: string, factory: ts.NodeFactory): ts.Node {
    // (globalThis as any)
    const parentheses = factory.createParenthesizedExpression(
        factory.createAsExpression(
            factory.createIdentifier('globalThis'),
            factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword),
        )
    )

    // (globalThis as any).name
    const accessor = factory.createPropertyAccessExpression(
        parentheses,
        factory.createIdentifier(name),
    )

    // (globalThis as any).name = name
    const binary = factory.createBinaryExpression(
        accessor,
        ts.SyntaxKind.EqualsToken,
        factory.createIdentifier(name),
    )

    const expr = factory.createExpressionStatement(binary);

    (binary as any).parent = expr;
    (accessor as any).parent = binary;
    (parentheses as any).parent = accessor;

    return expr
}

export function exportToGlobal(node: ts.ExportDeclaration, factory: ts.NodeFactory): ts.Node | ts.Node[] {
    const clause = node.exportClause;
    if (clause === undefined) {
        return node;
    }

    const elements = (clause as ts.NamedExports).elements;
    const nodes: ts.Node[] = [];
    for (const element of elements) {
        nodes.push(generateGlobalExpression(
            element.getText(),
            factory
        ))
    }

    return nodes;
}