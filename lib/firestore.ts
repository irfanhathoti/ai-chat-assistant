import {
  collection,
  doc,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  serverTimestamp,
  query,
  orderBy,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Chat, Message, Role } from "@/types/chat";

// ---- Path helpers ----------------------------------------------------------

const chatsCol = (uid: string) => collection(db, "users", uid, "chats");
const messagesCol = (uid: string, chatId: string) =>
  collection(db, "users", uid, "chats", chatId, "messages");

// ---- Chats -----------------------------------------------------------------

/** Create a new (empty) chat and return its id. */
export async function createChat(uid: string, title = "New Chat"): Promise<string> {
  const ref = await addDoc(chatsCol(uid), {
    title,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

/** Load all chats for a user, most recently updated first. */
export async function getChats(uid: string): Promise<Chat[]> {
  const q = query(chatsCol(uid), orderBy("updatedAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Chat, "id">) }));
}

/** Rename a chat (used to auto-generate a title from the first message). */
export async function updateChatTitle(
  uid: string,
  chatId: string,
  title: string
): Promise<void> {
  await updateDoc(doc(db, "users", uid, "chats", chatId), {
    title,
    updatedAt: serverTimestamp(),
  });
}

/** Bump updatedAt so the chat floats to the top of the sidebar. */
export async function touchChat(uid: string, chatId: string): Promise<void> {
  await updateDoc(doc(db, "users", uid, "chats", chatId), {
    updatedAt: serverTimestamp(),
  });
}

/** Delete a chat and all of its messages. */
export async function deleteChat(uid: string, chatId: string): Promise<void> {
  const msgSnap = await getDocs(messagesCol(uid, chatId));
  const batch = writeBatch(db);
  msgSnap.docs.forEach((d) => batch.delete(d.ref));
  batch.delete(doc(db, "users", uid, "chats", chatId));
  await batch.commit();
}

// ---- Messages --------------------------------------------------------------

/** Load all messages for a chat in chronological order. */
export async function getMessages(uid: string, chatId: string): Promise<Message[]> {
  const q = query(messagesCol(uid, chatId), orderBy("createdAt", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Message, "id">) }));
}

/** Append a message to a chat. Returns the new message id. */
export async function addMessage(
  uid: string,
  chatId: string,
  role: Role,
  content: string
): Promise<string> {
  const ref = await addDoc(messagesCol(uid, chatId), {
    role,
    content,
    createdAt: serverTimestamp(),
  });
  // Keep the parent chat's updatedAt fresh.
  await touchChat(uid, chatId);
  return ref.id;
}
