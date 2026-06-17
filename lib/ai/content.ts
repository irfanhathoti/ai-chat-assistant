import type { ContentPart } from "@/types/chat";

/**
 * Flatten multimodal content to a single string for text-only providers
 * (OpenAI/Groq here). Text parts pass through; image/PDF parts become a short
 * placeholder so the model knows an unsupported attachment was present and can
 * ask the user to switch to Claude (which has native image/PDF support).
 */
export function flattenToText(content: string | ContentPart[]): string {
  if (typeof content === "string") return content;
  return content
    .map((part) => {
      if (part.type === "text") return part.text;
      return `[Attachment "${part.name}" (${part.type}) omitted — this provider can't read it. Switch to Claude to analyze ${part.type}s.]`;
    })
    .join("\n\n");
}
