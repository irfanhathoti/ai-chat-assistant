import type { ContentPart } from "@/types/chat";

/** How an uploaded file is sent to the model. */
export type AttachmentKind = "image" | "document" | "text";

/** A processed file ready to attach to a message (client-side). */
export interface Attachment {
  id: string;
  name: string;
  /** MIME type, best-effort (may be empty on Windows — we fall back to ext). */
  mediaType: string;
  kind: AttachmentKind;
  size: number;
  /** base64 (image/document) or extracted UTF-8 text (text). */
  data: string;
}

/** Lightweight metadata persisted/rendered with a message (no payload). */
export interface AttachmentMeta {
  name: string;
  kind: AttachmentKind;
  size: number;
}

/** Per-file size ceiling. Claude accepts PDFs up to ~32MB; we stay conservative. */
export const MAX_FILE_BYTES = 20 * 1024 * 1024; // 20 MB
/** Max files per message. */
export const MAX_FILES = 5;

const IMAGE_EXTS = new Set(["png", "jpg", "jpeg", "gif", "webp"]);

/** Text-readable formats (docs + source code). Broad on purpose. */
const TEXT_EXTS = new Set([
  "txt", "text", "md", "markdown", "rst",
  "csv", "tsv", "json", "jsonl", "xml", "yaml", "yml", "toml", "ini", "env", "conf", "cfg",
  "html", "htm", "css", "scss", "less",
  "js", "jsx", "ts", "tsx", "mjs", "cjs",
  "py", "rb", "php", "java", "kt", "kts", "go", "rs", "swift",
  "c", "h", "cpp", "cc", "cxx", "hpp", "cs", "m", "mm",
  "sh", "bash", "zsh", "ps1", "bat", "sql", "graphql", "gql",
  "log", "gitignore", "dockerfile", "makefile", "properties",
]);

function extOf(name: string): string {
  const i = name.lastIndexOf(".");
  const ext = i >= 0 ? name.slice(i + 1).toLowerCase() : "";
  // Handle extension-less names like "Dockerfile" / "Makefile".
  if (!ext) return name.toLowerCase();
  return ext;
}

/** Human-readable size, e.g. "1.4 MB". */
export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Decide how a file should be handled, or return null if unsupported. */
function classify(file: File): AttachmentKind | null {
  const mime = file.type.toLowerCase();
  const ext = extOf(file.name);

  if (mime.startsWith("image/") || IMAGE_EXTS.has(ext)) return "image";
  if (mime === "application/pdf" || ext === "pdf") return "document";
  if (
    mime.startsWith("text/") ||
    mime === "application/json" ||
    mime === "application/xml" ||
    mime === "application/javascript" ||
    TEXT_EXTS.has(ext)
  ) {
    return "text";
  }
  return null;
}

function readAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read file"));
    reader.readAsText(file);
  });
}

/** Read a file as base64 (strips the "data:...;base64," prefix). */
function readAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? "");
      const comma = result.indexOf(",");
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

/**
 * Convert a browser File into an Attachment, throwing a user-friendly Error for
 * unsupported types or oversized files (the caller surfaces it via a toast).
 */
export async function fileToAttachment(file: File): Promise<Attachment> {
  const kind = classify(file);
  if (!kind) {
    throw new Error(
      `"${file.name}" isn't supported. Use a PDF, an image, or a text/code file ` +
        `(Word/Excel: export to PDF first).`
    );
  }
  if (file.size > MAX_FILE_BYTES) {
    throw new Error(`"${file.name}" is too large (max ${formatSize(MAX_FILE_BYTES)}).`);
  }

  const data = kind === "text" ? await readAsText(file) : await readAsBase64(file);
  const mediaType =
    file.type || (kind === "document" ? "application/pdf" : "application/octet-stream");

  return {
    id: crypto.randomUUID(),
    name: file.name,
    mediaType,
    kind,
    size: file.size,
    data,
  };
}

/** Strip the heavy payload, keeping just what we render/persist. */
export function toMeta(a: Attachment): AttachmentMeta {
  return { name: a.name, kind: a.kind, size: a.size };
}

/**
 * Turn an Attachment into the provider-agnostic ContentPart sent to the API.
 * Text files are wrapped with clear delimiters so the model treats them as a
 * referenced document rather than as the user's own words.
 */
export function toContentPart(a: Attachment): ContentPart {
  if (a.kind === "image") {
    return { type: "image", mediaType: a.mediaType, data: a.data, name: a.name };
  }
  if (a.kind === "document") {
    return { type: "document", mediaType: "application/pdf", data: a.data, name: a.name };
  }
  return {
    type: "text",
    text: `--- Attached file: ${a.name} ---\n${a.data}\n--- End of ${a.name} ---`,
  };
}
