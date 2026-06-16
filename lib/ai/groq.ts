import OpenAI from "openai";
import type { ChatMessage } from "@/types/chat";

// Groq exposes an OpenAI-compatible API, so we reuse the OpenAI SDK with a
// custom baseURL. Free tier requires no credit card — get a key at
// https://console.groq.com/keys. Browse models at console.groq.com/docs/models.

/** Free, fast default model. Override with GROQ_MODEL if it's deprecated. */
export const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

/** Max tokens for a single response. `|| 4096` guards an empty/NaN env value. */
export const GROQ_MAX_TOKENS = Number(process.env.GROQ_MAX_TOKENS) || 4096;

const SYSTEM_PROMPT =
  "You are a helpful, friendly AI assistant. Answer clearly and concisely. " +
  "Use Markdown for formatting (code blocks, lists, tables) when it improves readability.";

let client: OpenAI | null = null;
function getClient(): OpenAI {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not set");
  }
  if (!client) {
    client = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
    });
  }
  return client;
}

/** Call Groq (OpenAI-compatible) and return the assistant's text reply. */
export async function generateGroqResponse(
  messages: ChatMessage[]
): Promise<string> {
  const chatMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  const completion = await getClient().chat.completions.create({
    model: GROQ_MODEL,
    max_tokens: GROQ_MAX_TOKENS,
    messages: chatMessages,
  });

  return completion.choices[0]?.message?.content?.trim() ?? "";
}
