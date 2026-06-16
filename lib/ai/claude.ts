import Anthropic from "@anthropic-ai/sdk";
import type { ChatMessage } from "@/types/chat";

// ---- Configuration (keep model + limits in one place) ----------------------

/** Current Claude model. Change here to upgrade everywhere. */
export const CLAUDE_MODEL = "claude-opus-4-8";

/** Max tokens for a single response. Configurable via env if desired.
 *  `|| 4096` guards against an empty / non-numeric env value (which `??`
 *  would let through as 0 / NaN and break the request). */
export const CLAUDE_MAX_TOKENS = Number(process.env.CLAUDE_MAX_TOKENS) || 4096;

const SYSTEM_PROMPT =
  "You are a helpful, friendly AI assistant. Answer clearly and concisely. " +
  "Use Markdown for formatting (code blocks, lists, tables) when it improves readability.";

// Lazily construct the client so a missing key only fails the request, not the
// module import. The key is read from ANTHROPIC_API_KEY (server-side only).
let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

/**
 * Convert our provider-agnostic messages into Claude's message format.
 * Claude expects alternating user/assistant turns with no leading assistant
 * turn, so we drop any assistant message that appears before the first user
 * message.
 */
function toClaudeMessages(messages: ChatMessage[]): Anthropic.MessageParam[] {
  const cleaned: Anthropic.MessageParam[] = [];
  for (const m of messages) {
    if (cleaned.length === 0 && m.role !== "user") continue;
    cleaned.push({ role: m.role, content: m.content });
  }
  return cleaned;
}

/** Stream Claude's reply as text chunks. */
export async function* streamClaudeResponse(
  messages: ChatMessage[]
): AsyncGenerator<string> {
  const stream = await getClient().messages.create({
    model: CLAUDE_MODEL,
    max_tokens: CLAUDE_MAX_TOKENS,
    system: SYSTEM_PROMPT,
    messages: toClaudeMessages(messages),
    stream: true,
  });

  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      yield event.delta.text;
    }
  }
}

/** Call Claude and return the full assistant reply (collects the stream). */
export async function generateClaudeResponse(
  messages: ChatMessage[]
): Promise<string> {
  let out = "";
  for await (const chunk of streamClaudeResponse(messages)) out += chunk;
  return out.trim();
}
