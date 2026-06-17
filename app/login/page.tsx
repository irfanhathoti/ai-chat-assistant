"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { signInWithGoogle } from "@/lib/auth";
import Button from "@/components/ui/Button";
import Logo from "@/components/ui/Logo";

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [signingIn, setSigningIn] = useState(false);

  // If already logged in, go straight to the chat.
  useEffect(() => {
    if (!loading && user) router.replace("/chat");
  }, [user, loading, router]);

  async function handleSignIn() {
    try {
      setSigningIn(true);
      await signInWithGoogle();
      toast.success("Signed in successfully");
      router.replace("/chat");
    } catch (err) {
      console.error(err);
      toast.error("Sign-in failed. Please try again.");
    } finally {
      setSigningIn(false);
    }
  }

  if (loading || user) {
    return (
      <div className="animated-gradient flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-300" />
      </div>
    );
  }

  return (
    <div className="animated-gradient relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      {/* floating glow blobs */}
      <div className="glow-blob left-1/4 top-1/4 h-72 w-72 bg-indigo-600" />
      <div className="glow-blob bottom-1/4 right-1/4 h-72 w-72 bg-purple-600" />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="glass relative z-10 w-full max-w-md rounded-3xl p-8 shadow-2xl shadow-black/40"
      >
        <div className="mb-8 text-center">
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto mb-5 flex h-16 w-16 items-center justify-center"
          >
            <Logo size={64} className="drop-shadow-[0_8px_24px_rgba(99,102,241,0.45)]" />
          </motion.div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            AI Chat Assistant
          </h1>
          <p className="mt-2 text-sm text-slate-300">
            Sign in to start chatting with Claude.
          </p>
        </div>

        <Button
          onClick={handleSignIn}
          disabled={signingIn}
          size="lg"
          variant="secondary"
          className="w-full"
        >
          {signingIn ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <GoogleIcon />
          )}
          <span>{signingIn ? "Signing in…" : "Continue with Google"}</span>
        </Button>

        <p className="mt-6 text-center text-xs text-slate-400">
          By continuing you agree to our Terms & Privacy Policy.
        </p>
      </motion.div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.24 1.4-1.7 4.1-5.5 4.1-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.9 3 14.7 2 12 2 6.9 2 2.8 6.1 2.8 11.2S6.9 20.4 12 20.4c5.3 0 8.8-3.7 8.8-9 0-.6-.07-1-.16-1.5H12z"
      />
    </svg>
  );
}
