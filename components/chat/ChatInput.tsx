"use client";

import {
  useRef,
  useState,
  useEffect,
  type KeyboardEvent,
  type FormEvent,
} from "react";
import { motion } from "framer-motion";
import { ArrowUp, Loader2 } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  /** Disables sending while a response is streaming in. */
  disabled?: boolean;
}

/** Premium auto-growing input fixed at the bottom of the chat window. */
export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize the textarea up to a max height.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [value]);

  function submit() {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    submit();
  }

  // Enter sends, Shift+Enter inserts a newline.
  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  const canSend = !disabled && value.trim().length > 0;

  return (
    <div className="px-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-2 sm:px-4">
      <form
        onSubmit={handleSubmit}
        className="glass-strong mx-auto flex max-w-3xl items-end gap-2 rounded-[1.25rem] p-2 shadow-xl shadow-black/40 transition-colors duration-200 focus-within:border-indigo-400/40 focus-within:ring-1 focus-within:ring-indigo-400/30"
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Message AI Assistant…"
          className="thin-scrollbar max-h-[200px] flex-1 resize-none bg-transparent px-3 py-2.5 text-[15px] leading-relaxed text-slate-100 placeholder-slate-500 outline-none"
        />
        <motion.button
          type="submit"
          disabled={!canSend}
          whileHover={canSend ? { scale: 1.06 } : undefined}
          whileTap={canSend ? { scale: 0.9 } : undefined}
          transition={{ type: "spring", stiffness: 400, damping: 22 }}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-950/50 transition-all duration-200 hover:brightness-110 disabled:cursor-not-allowed disabled:from-white/10 disabled:to-white/10 disabled:text-slate-500 disabled:shadow-none"
          aria-label="Send message"
        >
          {disabled ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <ArrowUp className="h-5 w-5" />
          )}
        </motion.button>
      </form>
      <p className="mt-2 hidden text-center text-xs text-slate-500 sm:block">
        Press <kbd className="rounded bg-white/10 px-1 font-sans">Enter</kbd> to send,{" "}
        <kbd className="rounded bg-white/10 px-1 font-sans">Shift</kbd> +{" "}
        <kbd className="rounded bg-white/10 px-1 font-sans">Enter</kbd> for a new line.
      </p>
    </div>
  );
}
