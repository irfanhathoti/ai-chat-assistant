import type { Timestamp } from "firebase/firestore";

/** The two roles we persist + render. Keep in sync with Firestore + AI providers. */
export type Role = "user" | "assistant";

/** A single chat conversation: users/{uid}/chats/{chatId} */
export interface Chat {
  id: string;
  title: string;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}

/** A single message: users/{uid}/chats/{chatId}/messages/{messageId} */
export interface Message {
  id: string;
  role: Role;
  content: string;
  createdAt: Timestamp | null;
}

/** ---- Multimodal content parts -------------------------------------------
 * A message's content is either a plain string (the common case) or an array
 * of typed parts so users can attach files. Each provider adapter maps these
 * to its own format (Claude has native image/PDF support; OpenAI/Groq get a
 * text fallback). `data` is base64 for image/document, raw text for text.
 */
export interface TextPart {
  type: "text";
  text: string;
}
export interface ImagePart {
  type: "image";
  /** e.g. "image/png", "image/jpeg" */
  mediaType: string;
  /** base64-encoded bytes (no data: prefix) */
  data: string;
  name: string;
}
export interface DocumentPart {
  type: "document";
  /** Currently always "application/pdf" (Claude's native document type). */
  mediaType: string;
  /** base64-encoded bytes (no data: prefix) */
  data: string;
  name: string;
}
export type ContentPart = TextPart | ImagePart | DocumentPart;

/**
 * Provider-agnostic message shape sent to /api/chat.
 * Deliberately decoupled from Firestore (no Timestamp, no id) so any AI
 * provider adapter can map it to its own format.
 */
export interface ChatMessage {
  role: Role;
  content: string | ContentPart[];
}
