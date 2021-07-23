import * as ts from 'typescript';

type ResultType = ts.Node | ts.Node[] | undefined;

export function generateGlobalExpression(name: string, factory: ts.NodeFactory, fromExportedScope?: boolean): ts.Node {
  // (globalThis as any)
  const parentheses = factory.createParenthesizedExpression(
    factory.createAsExpression(
      factory.createIdentifier('globalThis'),
      factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword),
    ),
  );

  // (globalThis as any).name
  const accessor = factory.createPropertyAccessExpression(parentheses, factory.createIdentifier(name));

  let rightIdentifier: ts.Expression;
  if (fromExportedScope) {
    const exported = factory.createIdentifier('____exports');
    rightIdentifier = factory.createPropertyAccessExpression(exported, name);

    (exported as any).parent = rightIdentifier;
  } else {
    rightIdentifier = factory.createIdentifier(name);
  }

  // (globalThis as any).name = [____exports.]name
  const binary = factory.createBinaryExpression(accessor, ts.SyntaxKind.EqualsToken, rightIdentifier);

  const expr = factory.createExpressionStatement(binary);

  (rightIdentifier as any).parent = binary;
  (binary as any).parent = expr;
  (accessor as any).parent = binary;
  (parentheses as any).parent = accessor;

  return expr;
}

export function exportDeclarationToGlobal(node: ts.Node, ctx: ts.TransformationContext): ResultType {
  if (!ts.isExportDeclaration(node)) {
    return undefined;
  }

  const clause = node.exportClause;
  if (clause === undefined) {
    return node;
  }

  const elements = (clause as ts.NamedExports).elements;
  const nodes: ts.Node[] = [];
  for (const element of elements) {
    nodes.push(generateGlobalExpression(element.getText(), ctx.factory));
  }

  return nodes;
}

export function exportAssignmentToGlobal(node: ts.Node, ctx: ts.TransformationContext): ResultType {
  if (!ts.isExportAssignment(node)) {
    return undefined;
  }

  return generateGlobalExpression(node.expression.getText(), ctx.factory);
}

export function exportToGlobal(node: ts.Node, ctx: ts.TransformationContext): ts.Node | ts.Node[] | undefined {
  const chain: ((n: ts.Node, c: ts.TransformationContext) => ResultType)[] = [
    exportDeclarationToGlobal,
    exportAssignmentToGlobal,
  ];
  for (const f of chain) {
    const result = f(node, ctx);
    if (result) {
      return result;
    }
  }

  return undefined;
}
