import type { ChatMessage } from "@/types/chat";
import { generateClaudeResponse, streamClaudeResponse } from "./claude";
import { generateOpenAIResponse, streamOpenAIResponse } from "./openai";
import { generateGroqResponse, streamGroqResponse } from "./groq";

/** Supported AI providers. Add more here + a matching case below. */
export type AIProvider = "claude" | "openai" | "groq";

export interface GenerateAIResponseParams {
  messages: ChatMessage[];
  provider?: AIProvider;
}

/** Resolve the default provider from env (AI_PROVIDER), falling back to claude. */
export function getDefaultProvider(): AIProvider {
  const env = (process.env.AI_PROVIDER ?? "claude").toLowerCase();
  if (env === "openai") return "openai";
  if (env === "groq") return "groq";
  return "claude";
}

/**
 * Single entry point the API route calls. Dispatches to the chosen provider.
 * Select the provider per-deploy with the AI_PROVIDER env var ("claude" | "openai")
 * or per-request via the optional `provider` argument.
 */
export async function generateAIResponse({
  messages,
  provider = getDefaultProvider(),
}: GenerateAIResponseParams): Promise<string> {
  switch (provider) {
    case "claude":
      return generateClaudeResponse(messages);
    case "openai":
      return generateOpenAIResponse(messages);
    case "groq":
      return generateGroqResponse(messages);
    default:
      throw new Error(`Unsupported AI provider: ${provider}`);
  }
}

/**
 * Streaming entry point — yields the assistant reply as text chunks.
 * Used by the API route to stream the response to the browser.
 */
export function streamAIResponse({
  messages,
  provider = getDefaultProvider(),
}: GenerateAIResponseParams): AsyncGenerator<string> {
  switch (provider) {
    case "claude":
      return streamClaudeResponse(messages);
    case "openai":
      return streamOpenAIResponse(messages);
    case "groq":
      return streamGroqResponse(messages);
    default:
      throw new Error(`Unsupported AI provider: ${provider}`);
  }
}
