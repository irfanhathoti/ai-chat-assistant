"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  LogOut,
  MessageSquare,
  Plus,
  Trash2,
  X,
  Sparkles,
} from "lucide-react";
import type { Chat } from "@/types/chat";
import type { User } from "@/lib/auth";
import Button from "@/components/ui/Button";

interface ChatSidebarProps {
  chats: Chat[];
  activeChatId: string | null;
  user: User;
  /** Mobile drawer open state. */
  open: boolean;
  onClose: () => void;
  onSelect: (chatId: string) => void;
  onNewChat: () => void;
  onDelete: (chatId: string) => void;
  onLogout: () => void;
}

export default function ChatSidebar({
  chats,
  activeChatId,
  user,
  open,
  onClose,
  onSelect,
  onNewChat,
  onDelete,
  onLogout,
}: ChatSidebarProps) {
  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-30 bg-black/70 backdrop-blur-sm md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar — static on desktop, slide-in drawer on mobile */}
      <aside
        className={`glass-strong fixed inset-y-0 left-0 z-40 flex w-80 shrink-0 flex-col rounded-r-3xl shadow-2xl shadow-black/50 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] md:static md:w-72 md:translate-x-0 md:rounded-none md:border-y-0 md:border-l-0 md:shadow-none ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 shadow-lg shadow-indigo-950/50 ring-1 ring-white/20">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold tracking-tight text-white">AI Chat</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white md:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* New chat */}
        <div className="px-3">
          <Button onClick={onNewChat} className="w-full" size="md">
            <Plus className="h-4 w-4" />
            New Chat
          </Button>
        </div>

        {/* Chat list */}
        <nav className="thin-scrollbar mt-4 min-h-0 flex-1 space-y-1 overflow-y-auto px-3 pb-2">
          {chats.length === 0 && (
            <p className="px-2 py-8 text-center text-sm text-slate-500">
              No chats yet.
              <br />
              Start a new one!
            </p>
          )}
          <AnimatePresence initial={false}>
            {chats.map((chat) => {
              const active = chat.id === activeChatId;
              return (
                <motion.div
                  key={chat.id}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className={`group relative flex items-center gap-1 rounded-xl py-2.5 pl-3 pr-1.5 text-sm transition-colors duration-200 ${
                    active
                      ? "bg-gradient-to-r from-indigo-500/20 to-violet-500/[0.06] text-white"
                      : "text-slate-300 hover:bg-white/[0.06] hover:text-white"
                  }`}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-indigo-400 to-violet-500" />
                  )}
                  <button
                    onClick={() => onSelect(chat.id)}
                    className="flex flex-1 items-center gap-2.5 truncate text-left"
                  >
                    <MessageSquare
                      className={`h-4 w-4 shrink-0 transition-colors ${
                        active
                          ? "text-indigo-300"
                          : "text-slate-500 group-hover:text-indigo-300"
                      }`}
                    />
                    <span className="truncate">{chat.title}</span>
                  </button>
                  <button
                    onClick={() => onDelete(chat.id)}
                    className="rounded-md p-1.5 text-slate-500 opacity-100 transition-colors hover:bg-red-500/20 hover:text-red-300 sm:opacity-0 sm:group-hover:opacity-100"
                    aria-label="Delete chat"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </nav>

        {/* Footer: user + logout */}
        <div className="border-t border-white/10 p-3">
          <div className="flex items-center gap-3 rounded-xl px-2 py-2">
            {user.photoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.photoURL}
                alt={user.displayName ?? "User"}
                className="h-9 w-9 rounded-full ring-1 ring-white/15"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-medium text-white ring-1 ring-white/15">
                {(user.displayName ?? user.email ?? "U")[0].toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">
                {user.displayName ?? "User"}
              </p>
              <p className="truncate text-xs text-slate-400">{user.email}</p>
            </div>
          </div>
          <Button
            onClick={onLogout}
            variant="ghost"
            size="sm"
            className="mt-1 w-full justify-start"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </Button>
        </div>
      </aside>
    </>
  );
}
