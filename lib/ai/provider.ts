import type { ChatMessage } from "@/types/chat";
import { generateClaudeResponse } from "./claude";

/**
 * Supported AI providers. Add "openai" here and a matching case below when
 * you're ready — no other file needs to change.
 */
export type AIProvider = "claude"; // | "openai"

export interface GenerateAIResponseParams {
  messages: ChatMessage[];
  provider?: AIProvider;
}

/** Resolve the default provider from env, falling back to "claude". */
export function getDefaultProvider(): AIProvider {
  const env = (process.env.AI_PROVIDER ?? "claude").toLowerCase();
  // When more providers exist, validate against the union here.
  return env === "claude" ? "claude" : "claude";
}

/**
 * Single entry point the API route calls. Dispatches to the chosen provider.
 *
 * To add OpenAI later:
 *   1. Create lib/ai/openai.ts exporting generateOpenAIResponse(messages).
 *   2. Add "openai" to AIProvider.
 *   3. Add a `case "openai":` branch below.
 */
export async function generateAIResponse({
  messages,
  provider = getDefaultProvider(),
}: GenerateAIResponseParams): Promise<string> {
  switch (provider) {
    case "claude":
      return generateClaudeResponse(messages);
    // case "openai":
    //   return generateOpenAIResponse(messages);
    default:
      throw new Error(`Unsupported AI provider: ${provider}`);
  }
}
