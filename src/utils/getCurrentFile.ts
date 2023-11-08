import * as vscode from "vscode";

export function getCurrentFile() {
  const editor = vscode.window.activeTextEditor;
  if (editor) {
    const document = editor.document;
    if (
      document.fileName.endsWith(".ts") ||
      document.fileName.endsWith(".tsx")
    ) {
      return { document, content: document.getText() };
    }
  }
  return { document: undefined, content: undefined };
}
