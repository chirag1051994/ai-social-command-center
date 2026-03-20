import Anthropic from "@anthropic-ai/sdk";

import { getAnthropicApiKey } from "@/lib/env";

export function createAnthropicClient() {
  return new Anthropic({
    apiKey: getAnthropicApiKey(),
  });
}

export function extractTextFromMessage(
  content: Anthropic.Messages.Message["content"],
): string {
  return content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();
}

export function parseJsonObject<T>(value: string): T {
  const trimmed = value.trim();
  const startIndex = trimmed.indexOf("{");
  const endIndex = trimmed.lastIndexOf("}");

  if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
    throw new Error("Invalid AI JSON response");
  }

  return JSON.parse(trimmed.slice(startIndex, endIndex + 1)) as T;
}
