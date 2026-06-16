import type { ChatMessage } from "@/types/chat";
import { generateClaudeResponse } from "./claude";
import { generateOpenAIResponse } from "./openai";
import { generateGroqResponse } from "./groq";

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
