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
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 280, damping: 26 }}
      className={`flex w-full gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar */}
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
          isUser
            ? "border border-white/10 bg-white/[0.07]"
            : "bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 shadow-lg shadow-indigo-950/50 ring-1 ring-white/20"
        }`}
      >
        {isUser ? (
          <UserIcon className="h-[18px] w-[18px] text-slate-300" />
        ) : (
          <Sparkles className="h-[18px] w-[18px] text-white" />
        )}
      </div>

      {/* Bubble */}
      <div
        className={`group flex max-w-[85%] flex-col sm:max-w-[80%] ${
          isUser ? "items-end" : "items-start"
        }`}
      >
        <div
          className={`rounded-2xl px-4 py-3 text-[15px] leading-relaxed ${
            isUser
              ? "rounded-tr-sm bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-950/40"
              : "glass rounded-tl-sm text-slate-100 shadow-sm shadow-black/20"
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
            className={`mt-1.5 inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs transition-all duration-200 hover:bg-white/10 sm:opacity-0 sm:group-hover:opacity-100 ${
              copied ? "text-emerald-300" : "text-slate-400 hover:text-slate-200"
            }`}
            aria-label="Copy message"
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
