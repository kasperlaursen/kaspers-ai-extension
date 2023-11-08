import OpenAI from "openai";
import * as vscode from "vscode";

const ASSISTANT_ID = "asst_NeHhUDRfC5J6ZTK18Zfe9eEb";
const THREAD_ID = "thread_IcNKECrFHHnN4giOP3GTtm8K";
const RETRY_DELAY = 1000;
const TIMEOUT = 60 * 1000;

export async function getDocsFromGPT(
  fileContents: string,
  openai: OpenAI,
  progress: vscode.Progress<{
    message?: string | undefined;
    increment?: number | undefined;
  }>
) {
  progress && progress.report({ message: "🤖 Initializing ChatGPT: ..." });

  await openai.beta.threads.messages.create(THREAD_ID, {
    role: "user",
    content: fileContents,
  });
  progress &&
    progress.report({ message: "🤖 Initializing ChatGPT: Creating message." });

  const run = await openai.beta.threads.runs.create(THREAD_ID, {
    assistant_id: ASSISTANT_ID,
    instructions: "",
  });
  progress &&
    progress.report({ message: "🤖 Initializing ChatGPT: Started run." });

  let counter = 0;
  let runStatus = await openai.beta.threads.runs.retrieve(THREAD_ID, run.id);

  // Polling mechanism to see if runStatus is completed
  while (runStatus.status !== "completed" && counter <= TIMEOUT) {
    progress &&
      progress.report({ message: "⏳ Waiting for ChatGPT response." });
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
    runStatus = await openai.beta.threads.runs.retrieve(THREAD_ID, run.id);

    if (counter >= TIMEOUT) {
      progress &&
        progress.report({ message: "⌛️  ChatGPT response TIMEOUT." });
      return null;
    }
    counter += RETRY_DELAY;
  }

  // Get the last assistant message from the messages array
  const messages = await openai.beta.threads.messages.list(THREAD_ID);
  progress && progress.report({ message: "🤖 Got ChatGPT response." });

  const lastMessageForRun = messages.data
    .filter(
      (message) => message.run_id === run.id && message.role === "assistant"
    )
    .pop();

  const messageContent = lastMessageForRun?.content?.[0];

  return messageContent?.type === "text"
    ? messageContent.text.value
        .replaceAll("```typescript", "")
        .replaceAll("```", "")
    : null;
}
