import { NextResponse } from "next/server";
import { generateAIResponse, type AIProvider } from "@/lib/ai/provider";
import type { ChatMessage } from "@/types/chat";

// Run on the Node.js runtime (the AI SDKs aren't Edge-compatible).
export const runtime = "nodejs";
// Never cache AI responses.
export const dynamic = "force-dynamic";
// Give the model room to finish (Vercel's default function timeout is short).
export const maxDuration = 60;

interface ChatRequestBody {
  message: string;
  history?: ChatMessage[];
  provider?: AIProvider;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ChatRequestBody;
    const { message, history = [], provider } = body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { error: "A non-empty 'message' is required." },
        { status: 400 }
      );
    }

    // Build the full conversation: prior history + the new user message.
    // (Each provider adapter validates its own API key and throws a clear
    // error if it's missing — surfaced by the catch block below.)
    const messages: ChatMessage[] = [
      ...history.map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: message },
    ];

    const reply = await generateAIResponse({ messages, provider });

    return NextResponse.json({ reply });
  } catch (err: unknown) {
    // Provider SDK errors carry a numeric `status`; surface a clear, safe
    // reason to the client instead of an opaque 500. Provider-agnostic — we
    // read `status`/`message` without importing a specific SDK.
    const status =
      typeof (err as { status?: unknown })?.status === "number"
        ? (err as { status: number }).status
        : 500;
    const rawMessage = err instanceof Error ? err.message : String(err);
    console.error(`[/api/chat] error (${status}):`, rawMessage);

    let clientMessage = "Failed to generate a response. Please try again.";
    if (/is not set/i.test(rawMessage)) {
      clientMessage =
        "The selected AI provider's API key is not configured on the server.";
    } else if (/credit balance|quota|insufficient/i.test(rawMessage)) {
      clientMessage =
        "The AI provider's credit/quota is exhausted. Add credits, or switch AI_PROVIDER to a free provider (e.g. groq).";
    } else if (status === 401 || status === 403) {
      clientMessage = "AI provider authentication failed — check the API key.";
    } else if (status === 429) {
      clientMessage = "Too many requests — please wait a moment and try again.";
    } else if (status >= 500) {
      clientMessage = "The AI provider is temporarily unavailable. Try again shortly.";
    }

    const safeStatus = status >= 400 && status < 600 ? status : 500;
    return NextResponse.json({ error: clientMessage }, { status: safeStatus });
  }
}
