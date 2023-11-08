import * as vscode from "vscode";

export async function overrideFileContents({
  document,
  newContent,
}: {
  document: vscode.TextDocument;
  newContent: string;
}) {
  const fullRange = new vscode.Range(
    document.positionAt(0),
    document.positionAt(document.getText().length)
  );

  const edit = new vscode.WorkspaceEdit();
  edit.replace(document.uri, fullRange, newContent);

  return vscode.workspace.applyEdit(edit);
}
