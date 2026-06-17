"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Logo from "@/components/ui/Logo";

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
        initial={{ opacity: 0, scale: 0.94, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center"
      >
        {/* Glowing logo */}
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-2xl bg-indigo-500/40 blur-2xl" />
          <Logo size={64} className="relative" />
        </div>

        <h2 className="bg-gradient-to-b from-white to-slate-400 bg-clip-text text-2xl font-bold text-transparent sm:text-3xl">
          How can I help you today?
        </h2>
        <p className="mt-2.5 max-w-md text-sm text-slate-400">
          Ask anything — or pick a suggestion to get started.
        </p>

        <div className="mt-8 grid w-full max-w-xl grid-cols-1 gap-3 sm:grid-cols-2">
          {SUGGESTIONS.map((s, i) => (
            <motion.button
              key={s}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 + i * 0.07, ease: "easeOut" }}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSuggestion?.(s)}
              className="glass group flex items-center justify-between gap-3 rounded-2xl p-4 text-left text-sm text-slate-200 transition-colors duration-200 hover:border-white/20 hover:bg-white/[0.09]"
            >
              <span className="leading-snug">{s}</span>
              <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-500 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-indigo-300" />
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
