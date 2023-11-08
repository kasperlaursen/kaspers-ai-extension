import * as vscode from "vscode";
import * as ts from "typescript";

export function extractExportedFunctions(
  document: vscode.TextDocument
): string[] {
  const sourceFile = ts.createSourceFile(
    document.fileName,
    document.getText(),
    ts.ScriptTarget.Latest,
    true
  );

  const exportedFunctions: string[] = [];

  const isNodeExported = (node: ts.Node): boolean => {
    return (
      (ts.getCombinedModifierFlags(node as ts.Declaration) &
        ts.ModifierFlags.Export) !==
        0 ||
      (!!node.parent && node.parent.kind === ts.SyntaxKind.SourceFile)
    );
  };

  const visit = (node: ts.Node) => {
    if (
      (ts.isFunctionDeclaration(node) || ts.isArrowFunction(node)) &&
      isNodeExported(node)
    ) {
      let functionName = node.name
        ? (node.name as ts.Identifier).text
        : "default";
      exportedFunctions.push(functionName);
    }
    ts.forEachChild(node, visit);
  };

  ts.forEachChild(sourceFile, visit);

  return exportedFunctions;
}
