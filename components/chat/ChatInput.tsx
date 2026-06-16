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

  return (
    <div className="px-4 pb-5 pt-2">
      <form
        onSubmit={handleSubmit}
        className="glass mx-auto flex max-w-3xl items-end gap-2 rounded-2xl p-2 shadow-lg shadow-black/30 focus-within:border-indigo-400/50"
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Message AI Assistant…"
          className="thin-scrollbar max-h-[200px] flex-1 resize-none bg-transparent px-3 py-2.5 text-[15px] text-slate-100 placeholder-slate-500 outline-none"
        />
        <motion.button
          type="submit"
          disabled={disabled || !value.trim()}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.92 }}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-900/40 transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Send message"
        >
          {disabled ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <ArrowUp className="h-5 w-5" />
          )}
        </motion.button>
      </form>
      <p className="mt-2 text-center text-xs text-slate-500">
        Press <kbd className="rounded bg-white/10 px-1">Enter</kbd> to send,{" "}
        <kbd className="rounded bg-white/10 px-1">Shift</kbd> +{" "}
        <kbd className="rounded bg-white/10 px-1">Enter</kbd> for a new line.
      </p>
    </div>
  );
}
