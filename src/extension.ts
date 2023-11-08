// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { getCurrentFile } from "./utils/getCurrentFile";
import { getDocsFromGPT } from "./utils/getDocsFromGPT";
import { overrideFileContents } from "./utils/overrideFileContents";
import AuthSettings from "./utils/AuthSettings";
import OpenAI from "openai";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Initialize and get current instance of our Secret Storage
  AuthSettings.init(context);
  const settings = AuthSettings.instance;

  // Register commands to save and retrieve token
  vscode.commands.registerCommand("kaspers-ai-extension.setToken", async () => {
    const tokenInput = await vscode.window.showInputBox();
    await settings.storeAuthData(tokenInput);
  });
  // Register commands to save and retrieve token
  vscode.commands.registerCommand(
    "kaspers-ai-extension.deleteToken",
    async () => {
      await settings.deleteAuthData();
    }
  );

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    "kaspers-ai-extension.generateDocsInFile",
    async () => {
      const token = await settings.getAuthData();
      
      if (token) {
        const openai = new OpenAI({
          apiKey: token,
        });

        await vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: "Generating jsDocs",
            cancellable: true,
          },
          async (progress, token) => {
            token.onCancellationRequested(() => {
              console.log("User canceled the long running operation");
            });

            const { document, content } = getCurrentFile();
            if (document) {
              progress.report({ increment: 0 });
              const response = await getDocsFromGPT(content, openai, progress);

              if (response) {
                overrideFileContents({
                  document,
                  newContent: response,
                }).then((success) => {
                  if (success) {
                    vscode.window.showInformationMessage("🤖 Docs Done!");
                  } else {
                    vscode.window.showInformationMessage(
                      "🚨 Failed to replace file contents"
                    );
                  }
                });
              } else {
                vscode.window.showInformationMessage(
                  "🚨 Failed to get response from ChatGPT"
                );
              }
              progress.report({ increment: 100 });
            } else {
              vscode.window.showInformationMessage("🚨 Failed to read file!");
            }
          }
        );
      } else {
        vscode.window.showInformationMessage(
          "🚨 Set your OpenAI Token by running command: Kaspers AI: Set Openai Token (REQUIRED)"
        );
      }
    }
  );

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
