"use client";

import { motion } from "framer-motion";
import { MessageSquarePlus, Sparkles } from "lucide-react";

interface EmptyChatStateProps {
  /** Optional handler to start a chat from a suggestion. */
  onSuggestion?: (text: string) => void;
}

const SUGGESTIONS = [
  "Explain quantum computing in simple terms",
  "Write a haiku about the ocean",
  "Help me plan a 3-day trip to Tokyo",
  "Debug this JavaScript error for me",
];

/** Friendly empty state shown when no chat is selected or a chat has no messages. */
export default function EmptyChatState({ onSuggestion }: EmptyChatStateProps) {
  return (
    <div className="m-auto flex flex-col items-center px-6 py-10 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col items-center"
      >
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-900/50">
          <Sparkles className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white">How can I help you today?</h2>
        <p className="mt-2 max-w-md text-sm text-slate-400">
          Ask anything — or pick a suggestion to get started.
        </p>

        <div className="mt-8 grid w-full max-w-xl grid-cols-1 gap-3 sm:grid-cols-2">
          {SUGGESTIONS.map((s, i) => (
            <motion.button
              key={s}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.07 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSuggestion?.(s)}
              className="glass group flex items-center gap-3 rounded-xl p-3.5 text-left text-sm text-slate-200 transition-colors hover:bg-white/10"
            >
              <MessageSquarePlus className="h-4 w-4 shrink-0 text-indigo-300" />
              <span>{s}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
