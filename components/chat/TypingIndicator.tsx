"use client";

import { motion } from "framer-motion";

/** Three softly pulsing dots shown while the assistant is composing a reply. */
export default function TypingIndicator() {
  return (
    <div
      className="flex items-center gap-1.5 px-1.5 py-2.5"
      aria-label="Assistant is typing"
    >
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-2 w-2 rounded-full bg-gradient-to-br from-indigo-300 to-violet-400"
          animate={{ y: [0, -4, 0], opacity: [0.35, 1, 0.35], scale: [0.9, 1, 0.9] }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.16,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
