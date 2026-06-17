"use client";

import {
  useRef,
  useState,
  useEffect,
  type ChangeEvent,
  type DragEvent,
  type KeyboardEvent,
  type FormEvent,
} from "react";
import { motion } from "framer-motion";
import {
  ArrowUp,
  FileText,
  ImageIcon,
  Loader2,
  Paperclip,
  Plus,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  fileToAttachment,
  formatSize,
  MAX_FILES,
  type Attachment,
} from "@/lib/attachments";

interface ChatInputProps {
  onSend: (message: string, attachments?: Attachment[]) => void;
  /** Disables sending while a response is streaming in. */
  disabled?: boolean;
}

function KindIcon({ kind }: { kind: Attachment["kind"] }) {
  const cls = "h-4 w-4 shrink-0 text-indigo-300";
  if (kind === "image") return <ImageIcon className={cls} />;
  if (kind === "document") return <FileText className={cls} />;
  return <Paperclip className={cls} />;
}

/** Premium auto-growing input with file attachments, fixed at the bottom. */
export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [processing, setProcessing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize the textarea up to a max height.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [value]);

  async function addFiles(files: FileList | File[]) {
    const list = Array.from(files);
    if (!list.length) return;

    const room = MAX_FILES - attachments.length;
    if (room <= 0) {
      toast.error(`You can attach up to ${MAX_FILES} files.`);
      return;
    }
    const accepted = list.slice(0, room);
    if (list.length > room) {
      toast.error(`Only ${MAX_FILES} files per message — extra files were skipped.`);
    }

    setProcessing(true);
    const ready: Attachment[] = [];
    for (const file of accepted) {
      try {
        ready.push(await fileToAttachment(file));
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Couldn't read that file.");
      }
    }
    if (ready.length) setAttachments((prev) => [...prev, ...ready]);
    setProcessing(false);
  }

  function handleFileInput(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files) addFiles(e.target.files);
    // Reset so selecting the same file again re-triggers onChange.
    e.target.value = "";
  }

  function removeAttachment(id: string) {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  }

  function submit() {
    const trimmed = value.trim();
    if (disabled || processing) return;
    if (!trimmed && attachments.length === 0) return;
    onSend(trimmed, attachments.length ? attachments : undefined);
    setValue("");
    setAttachments([]);
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

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  }

  const canSend =
    !disabled && !processing && (value.trim().length > 0 || attachments.length > 0);

  return (
    <div className="px-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-2 sm:px-4">
      <form
        onSubmit={handleSubmit}
        onDragOver={(e) => {
          e.preventDefault();
          if (!dragging) setDragging(true);
        }}
        onDragLeave={(e) => {
          if (e.currentTarget === e.target) setDragging(false);
        }}
        onDrop={handleDrop}
        className={`glass-strong mx-auto flex max-w-3xl flex-col gap-2 rounded-[1.25rem] p-2 shadow-xl shadow-black/40 transition-colors duration-200 focus-within:border-indigo-400/40 focus-within:ring-1 focus-within:ring-indigo-400/30 ${
          dragging ? "border-indigo-400/60 ring-2 ring-indigo-400/40" : ""
        }`}
      >
        {/* Attachment chips */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 px-1 pt-1">
            {attachments.map((a) => (
              <div
                key={a.id}
                className="group/chip flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 py-1.5 pl-2.5 pr-1.5 text-sm"
              >
                <KindIcon kind={a.kind} />
                <div className="flex min-w-0 flex-col leading-tight">
                  <span className="max-w-[160px] truncate text-slate-200">{a.name}</span>
                  <span className="text-[11px] text-slate-500">{formatSize(a.size)}</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeAttachment(a.id)}
                  className="ml-1 rounded-md p-1 text-slate-400 transition-colors hover:bg-white/10 hover:text-slate-200"
                  aria-label={`Remove ${a.name}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-end gap-2">
          {/* Attach button */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf,.txt,.md,.csv,.tsv,.json,.xml,.yaml,.yml,.html,.css,.js,.jsx,.ts,.tsx,.py,.java,.c,.cpp,.cs,.go,.rb,.php,.rs,.sql,.sh,.log"
            onChange={handleFileInput}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || processing || attachments.length >= MAX_FILES}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-white/10 hover:text-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Attach files"
            title="Attach images, PDFs, or text files"
          >
            {processing ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Plus className="h-5 w-5" />
            )}
          </button>

          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder={
              dragging ? "Drop files to attach…" : "Message AI Assistant…"
            }
            className="thin-scrollbar max-h-[200px] flex-1 resize-none bg-transparent px-1 py-2.5 text-[15px] leading-relaxed text-slate-100 placeholder-slate-500 outline-none"
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
        </div>
      </form>
      <p className="mt-2 hidden text-center text-xs text-slate-500 sm:block">
        Press <kbd className="rounded bg-white/10 px-1 font-sans">Enter</kbd> to send,{" "}
        <kbd className="rounded bg-white/10 px-1 font-sans">Shift</kbd> +{" "}
        <kbd className="rounded bg-white/10 px-1 font-sans">Enter</kbd> for a new line.
        Attach PDFs, images, or text files with{" "}
        <Plus className="inline h-3 w-3" />.
      </p>
    </div>
  );
}
