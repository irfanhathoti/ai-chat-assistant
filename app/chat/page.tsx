"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Menu } from "lucide-react";
import { toast } from "sonner";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatWindow, { type UIMessage } from "@/components/chat/ChatWindow";
import Logo from "@/components/ui/Logo";
import { useAuth } from "@/context/AuthContext";
import { logout } from "@/lib/auth";
import {
  createChat,
  getChats,
  getMessages,
  addMessage,
  deleteChat,
  updateChatTitle,
} from "@/lib/firestore";
import type { Chat } from "@/types/chat";
import {
  toContentPart,
  toMeta,
  type Attachment,
} from "@/lib/attachments";

/** Build a short chat title from the first user message. */
function titleFromMessage(text: string): string {
  const t = text.trim().replace(/\s+/g, " ");
  return t.length > 40 ? `${t.slice(0, 40)}…` : t;
}

function ChatPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const uid = user!.uid;

  // Load the chat list on mount.
  const refreshChats = useCallback(async () => {
    try {
      setChats(await getChats(uid));
    } catch (err) {
      console.error(err);
      toast.error("Failed to load chats.");
    }
  }, [uid]);

  useEffect(() => {
    refreshChats();
  }, [refreshChats]);

  // Select a chat and load its messages.
  async function handleSelect(chatId: string) {
    if (chatId === activeChatId) {
      setSidebarOpen(false);
      return;
    }
    setActiveChatId(chatId);
    setSidebarOpen(false);
    setLoadingMessages(true);
    try {
      const msgs = await getMessages(uid, chatId);
      setMessages(msgs.map((m) => ({ id: m.id, role: m.role, content: m.content })));
    } catch (err) {
      console.error(err);
      toast.error("Failed to load messages.");
    } finally {
      setLoadingMessages(false);
    }
  }

  // "New Chat" simply clears the view; the chat document is created lazily on
  // first send so we never persist empty chats.
  function handleNewChat() {
    setActiveChatId(null);
    setMessages([]);
    setSidebarOpen(false);
  }

  async function handleDelete(chatId: string) {
    try {
      await deleteChat(uid, chatId);
      if (chatId === activeChatId) handleNewChat();
      setChats((prev) => prev.filter((c) => c.id !== chatId));
      toast.success("Chat deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete chat.");
    }
  }

  async function handleLogout() {
    try {
      await logout();
      router.replace("/login");
    } catch (err) {
      console.error(err);
      toast.error("Failed to log out.");
    }
  }

  async function handleSend(text: string, attachments?: Attachment[]) {
    if (sending) return;
    const files = attachments ?? [];
    if (!text.trim() && files.length === 0) return;

    // Snapshot the prior conversation BEFORE adding the new message (used as
    // history for the AI request). Attachment bytes are NOT resent on later
    // turns — only the typed text is kept in history.
    const history = messages.map((m) => ({ role: m.role, content: m.content }));

    // What we persist/title with: the text, or the filenames if text is empty.
    const persistedText =
      text.trim() || files.map((f) => f.name).join(", ") || "(attachment)";

    // Optimistically render the user message (with attachment chips).
    const userMsg: UIMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      attachments: files.length ? files.map(toMeta) : undefined,
    };
    setMessages((prev) => [...prev, userMsg]);
    setSending(true);

    // Tracks whether the assistant reply began streaming — controls rollback.
    let streamingStarted = false;

    try {
      // Ensure we have a chat document (create lazily on first message).
      let chatId = activeChatId;
      let isNewChat = false;
      if (!chatId) {
        chatId = await createChat(uid, titleFromMessage(persistedText));
        setActiveChatId(chatId);
        isNewChat = true;
      }

      // Persist the user message (text + filename note; file bytes aren't stored).
      await addMessage(uid, chatId, "user", persistedText);

      // Call the server-side AI route (streams the reply chunk by chunk).
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history,
          attachments: files.length ? files.map(toContentPart) : undefined,
        }),
      });

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Request failed");
      }

      // Read the stream and grow the assistant bubble live.
      const assistantId = crypto.randomUUID();
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        if (!chunk) continue;
        acc += chunk;
        if (!streamingStarted) {
          streamingStarted = true;
          setMessages((prev) => [
            ...prev,
            { id: assistantId, role: "assistant", content: acc },
          ]);
        } else {
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, content: acc } : m))
          );
        }
      }
      acc = (acc + decoder.decode()).trim();
      setMessages((prev) =>
        prev.map((m) => (m.id === assistantId ? { ...m, content: acc } : m))
      );

      // Persist the assistant reply + refresh sidebar ordering/titles.
      if (acc) await addMessage(uid, chatId, "assistant", acc);
      if (isNewChat) await updateChatTitle(uid, chatId, titleFromMessage(persistedText));
      await refreshChats();
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      toast.error(msg);
      // Roll back the optimistic user message only if nothing streamed yet.
      if (!streamingStarted) {
        setMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
      }
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="animated-gradient flex h-dvh overflow-hidden">
      <ChatSidebar
        chats={chats}
        activeChatId={activeChatId}
        user={user!}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSelect={handleSelect}
        onNewChat={handleNewChat}
        onDelete={handleDelete}
        onLogout={handleLogout}
      />

      <main className="flex min-h-0 min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="flex shrink-0 items-center gap-3 p-3 md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="glass rounded-xl p-2 text-slate-200"
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <Logo size={28} />
            <span className="font-semibold text-white">AI Chat</span>
          </div>
        </header>

        <ChatWindow
          messages={messages}
          sending={sending}
          loadingMessages={loadingMessages}
          onSend={handleSend}
        />
      </main>
    </div>
  );
}

export default function Page() {
  return (
    <ProtectedRoute>
      <ChatPage />
    </ProtectedRoute>
  );
}
