import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Logo from "@/components/ui/Logo";

interface LegalPageProps {
  title: string;
  /** Human-readable effective date, e.g. "June 17, 2026". */
  lastUpdated: string;
  children: React.ReactNode;
}

/** Shared shell for the Terms and Privacy pages: brand header + prose body. */
export default function LegalPage({ title, lastUpdated, children }: LegalPageProps) {
  return (
    <div className="animated-gradient min-h-screen px-4 py-10 sm:py-16">
      <div className="mx-auto w-full max-w-3xl">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-slate-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>

        <article className="glass mt-4 rounded-3xl p-6 shadow-2xl shadow-black/40 sm:p-10">
          <div className="flex items-center gap-3">
            <Logo size={40} />
            <span className="text-lg font-semibold tracking-tight text-white">
              AI Chat Assistant
            </span>
          </div>

          <h1 className="mt-6 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {title}
          </h1>
          <p className="mt-1.5 text-sm text-slate-400">Last updated: {lastUpdated}</p>

          <div className="legal mt-6">{children}</div>

          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 border-t border-white/10 pt-6 text-sm">
            <Link
              href="/terms"
              className="text-indigo-300 underline underline-offset-2 hover:text-indigo-200"
            >
              Terms of Service
            </Link>
            <Link
              href="/privacy"
              className="text-indigo-300 underline underline-offset-2 hover:text-indigo-200"
            >
              Privacy Policy
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
}
