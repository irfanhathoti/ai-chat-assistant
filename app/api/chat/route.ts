import { NextResponse } from "next/server";
import { generateAIResponse, type AIProvider } from "@/lib/ai/provider";
import type { ChatMessage } from "@/types/chat";

// Run on the Node.js runtime (the Anthropic SDK isn't Edge-compatible).
export const runtime = "nodejs";
// Never cache AI responses.
export const dynamic = "force-dynamic";
// Give Claude room to finish (Vercel's default function timeout is short).
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

    if (!process.env.ANTHROPIC_API_KEY) {
      // Defensive: surface a clear, non-leaky error if the server is misconfigured.
      return NextResponse.json(
        { error: "Server is missing ANTHROPIC_API_KEY." },
        { status: 500 }
      );
    }

    // Build the full conversation: prior history + the new user message.
    const messages: ChatMessage[] = [
      ...history.map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: message },
    ];

    const reply = await generateAIResponse({ messages, provider });

    return NextResponse.json({ reply });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Unexpected server error.";
    console.error("[/api/chat] error:", message);
    return NextResponse.json(
      { error: "Failed to generate a response. Please try again." },
      { status: 500 }
    );
  }
}
