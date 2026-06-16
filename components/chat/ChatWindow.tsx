"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import EmptyChatState from "./EmptyChatState";
import MessageSkeleton from "./MessageSkeleton";
import ChatInput from "./ChatInput";
import type { Role } from "@/types/chat";

export interface UIMessage {
  id: string;
  role: Role;
  content: string;
}

interface ChatWindowProps {
  messages: UIMessage[];
  sending: boolean;
  /** True while messages for a selected chat are being fetched. */
  loadingMessages: boolean;
  onSend: (message: string) => void;
}

/** The main chat surface: scrollable message list + fixed input. */
export default function ChatWindow({
  messages,
  sending,
  loadingMessages,
  onSend,
}: ChatWindowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the latest message. Scroll the message CONTAINER itself
  // (not scrollIntoView, which scrolls ancestors and can shift the whole page,
  // dragging the sidebar and leaving a gap).
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  const isEmpty = messages.length === 0 && !sending && !loadingMessages;
  // Show the typing indicator only until the assistant's reply starts
  // streaming (i.e. while the last message is still the user's).
  const awaitingReply = messages[messages.length - 1]?.role === "user";

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        ref={scrollRef}
        className="thin-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto"
      >
        {loadingMessages ? (
          <MessageSkeleton />
        ) : isEmpty ? (
          <EmptyChatState onSuggestion={onSend} />
        ) : (
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6">
            <AnimatePresence initial={false}>
              {messages.map((m) => (
                <MessageBubble key={m.id} role={m.role} content={m.content} />
              ))}
            </AnimatePresence>

            {sending && awaitingReply && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
                  <span className="sr-only">Assistant</span>
                </div>
                <div className="glass rounded-2xl rounded-tl-md px-2">
                  <TypingIndicator />
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>

      <ChatInput onSend={onSend} disabled={sending} />
    </div>
  );
}
