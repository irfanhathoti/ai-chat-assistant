import { NextResponse } from "next/server";
import { streamAIResponse, type AIProvider } from "@/lib/ai/provider";
import type { ChatMessage, ContentPart } from "@/types/chat";

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
  /** Files attached to the new user message (images, PDFs, extracted text). */
  attachments?: ContentPart[];
}

/** Map a provider/SDK error to a clear, safe client message + HTTP status. */
function toErrorResponse(err: unknown): NextResponse {
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

export async function POST(req: Request) {
  let body: ChatRequestBody;
  try {
    body = (await req.json()) as ChatRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { message, history = [], provider, attachments = [] } = body;
  const hasText = typeof message === "string" && message.trim().length > 0;
  const hasAttachments = Array.isArray(attachments) && attachments.length > 0;
  if (!hasText && !hasAttachments) {
    return NextResponse.json(
      { error: "Provide a message or at least one attachment." },
      { status: 400 }
    );
  }

  // The new user turn: attachments first, then the typed message (if any).
  // A string keeps the common no-attachment path lightweight.
  const userContent: ChatMessage["content"] = hasAttachments
    ? [
        ...attachments,
        ...(hasText ? [{ type: "text" as const, text: message }] : []),
      ]
    : message;

  // Build the full conversation: prior history + the new user message.
  const messages: ChatMessage[] = [
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content: userContent },
  ];

  // Pull the FIRST chunk before committing to a streaming response. Setup
  // errors (missing key, auth, billing) throw here and are returned as a
  // normal JSON error with the right status. Once streaming starts, the HTTP
  // status is already 200, so later errors can only be reported in-band.
  const iterator = streamAIResponse({ messages, provider })[Symbol.asyncIterator]();
  let first: IteratorResult<string>;
  try {
    first = await iterator.next();
  } catch (err) {
    return toErrorResponse(err);
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        if (!first.done && first.value) {
          controller.enqueue(encoder.encode(first.value));
        }
        while (true) {
          const { value, done } = await iterator.next();
          if (done) break;
          if (value) controller.enqueue(encoder.encode(value));
        }
      } catch (err) {
        // Mid-stream failure — status is already sent, so append a notice.
        console.error("[/api/chat] mid-stream error:", err);
        controller.enqueue(
          encoder.encode("\n\n_⚠️ The response was interrupted._")
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      // Disable proxy buffering so chunks reach the browser immediately.
      "X-Accel-Buffering": "no",
    },
  });
}
