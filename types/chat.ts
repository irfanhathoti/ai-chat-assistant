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

/**
 * Provider-agnostic message shape sent to /api/chat.
 * Deliberately decoupled from Firestore (no Timestamp, no id) so any AI
 * provider adapter can map it to its own format.
 */
export interface ChatMessage {
  role: Role;
  content: string;
}
