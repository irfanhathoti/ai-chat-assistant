"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Check, Copy, Sparkles, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import type { Role } from "@/types/chat";

interface MessageBubbleProps {
  role: Role;
  content: string;
}

/** A single user/assistant chat bubble with copy-to-clipboard on assistant messages. */
export default function MessageBubble({ role, content }: MessageBubbleProps) {
  const isUser = role === "user";
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Could not copy");
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`flex w-full gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar */}
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
          isUser
            ? "bg-white/10"
            : "bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md shadow-indigo-900/40"
        }`}
      >
        {isUser ? (
          <UserIcon className="h-5 w-5 text-slate-200" />
        ) : (
          <Sparkles className="h-5 w-5 text-white" />
        )}
      </div>

      {/* Bubble */}
      <div className={`group flex max-w-[80%] flex-col ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`rounded-2xl px-4 py-3 text-[15px] leading-relaxed shadow-sm ${
            isUser
              ? "rounded-tr-md bg-gradient-to-br from-indigo-500 to-purple-600 text-white"
              : "glass rounded-tl-md text-slate-100"
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap break-words">{content}</p>
          ) : (
            <div className="markdown break-words">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            </div>
          )}
        </div>

        {/* Copy button (assistant only) */}
        {!isUser && (
          <button
            onClick={handleCopy}
            className="mt-1.5 flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-slate-400 opacity-0 transition-opacity hover:text-slate-200 group-hover:opacity-100"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5" /> Copied
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" /> Copy
              </>
            )}
          </button>
        )}
      </div>
    </motion.div>
  );
}
