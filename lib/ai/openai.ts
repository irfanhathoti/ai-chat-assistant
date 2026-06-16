import OpenAI from "openai";
import type { ChatMessage } from "@/types/chat";

// ---- Configuration (keep model + limits in one place) ----------------------

/** Current OpenAI model. Override with OPENAI_MODEL if your account differs. */
export const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

/** Max tokens for a single response. `|| 4096` guards an empty/NaN env value. */
export const OPENAI_MAX_TOKENS = Number(process.env.OPENAI_MAX_TOKENS) || 4096;

const SYSTEM_PROMPT =
  "You are a helpful, friendly AI assistant. Answer clearly and concisely. " +
  "Use Markdown for formatting (code blocks, lists, tables) when it improves readability.";

// Lazily construct the client so a missing key only fails the request, not the
// module import. The key is read from OPENAI_API_KEY (server-side only).
let client: OpenAI | null = null;
function getClient(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set");
  }
  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return client;
}

/** Call OpenAI Chat Completions and return the assistant's text reply. */
export async function generateOpenAIResponse(
  messages: ChatMessage[]
): Promise<string> {
  // Our roles ("user" | "assistant") map 1:1 onto OpenAI's chat roles.
  const chatMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  const completion = await getClient().chat.completions.create({
    model: OPENAI_MODEL,
    max_tokens: OPENAI_MAX_TOKENS,
    messages: chatMessages,
  });

  return completion.choices[0]?.message?.content?.trim() ?? "";
}
