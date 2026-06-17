"use client";

import { isValidElement, useState, type ReactNode } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";

/** Recursively pull the raw text out of a markdown <code> subtree. */
function extractText(node: ReactNode): string {
  if (node == null || node === false) return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (isValidElement(node)) {
    return extractText((node.props as { children?: ReactNode }).children);
  }
  return "";
}

/** Read the `language-xxx` class react-markdown puts on fenced code blocks. */
function extractLanguage(node: ReactNode): string | null {
  if (isValidElement(node)) {
    const className = (node.props as { className?: string }).className;
    const match = className?.match(/language-([\w-]+)/);
    if (match) return match[1];
  }
  return null;
}

/**
 * Replacement for the markdown `<pre>` element: a framed code block with a
 * language label and a per-block copy button (ChatGPT-style).
 */
export default function CodeBlock({ children }: { children?: ReactNode }) {
  const [copied, setCopied] = useState(false);
  const code = extractText(children).replace(/\n$/, "");
  const language = extractLanguage(children);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("Code copied");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Could not copy");
    }
  }

  return (
    <div className="my-3 overflow-hidden rounded-xl border border-white/10">
      <div className="flex items-center justify-between border-b border-white/10 bg-black/60 px-3 py-1.5">
        <span className="font-mono text-xs lowercase text-slate-400">
          {language ?? "code"}
        </span>
        <button
          onClick={copy}
          className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs transition-colors ${
            copied
              ? "text-emerald-300"
              : "text-slate-400 hover:bg-white/10 hover:text-slate-200"
          }`}
          aria-label="Copy code"
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
      </div>
      <pre className="thin-scrollbar overflow-x-auto bg-black/45 p-4">{children}</pre>
    </div>
  );
}
