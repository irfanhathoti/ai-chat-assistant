"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import EmptyChatState from "./EmptyChatState";
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
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the latest message whenever the list or typing state changes.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  const isEmpty = messages.length === 0 && !sending && !loadingMessages;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="thin-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto">
        {isEmpty ? (
          <EmptyChatState onSuggestion={onSend} />
        ) : (
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6">
            <AnimatePresence initial={false}>
              {messages.map((m) => (
                <MessageBubble key={m.id} role={m.role} content={m.content} />
              ))}
            </AnimatePresence>

            {sending && (
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

            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <ChatInput onSend={onSend} disabled={sending} />
    </div>
  );
}
