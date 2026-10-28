"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, HelpCircle } from "lucide-react";
import { YoutubeIcon } from "@/components/icons";
import { checkBackendHealth } from "@/lib/api";

export function Navbar() {
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    checkBackendHealth().then(setBackendOnline);
    const interval = setInterval(() => {
      checkBackendHealth().then(setBackendOnline);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ rotate: 12, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 via-rose-600 to-red-700 shadow-lg shadow-red-500/25"
            >
              <YoutubeIcon className="h-5 w-5 text-white" />
            </motion.div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-white group-hover:text-red-400 transition-colors">
                  YouTube<span className="text-red-500">Chat</span>
                </span>
                <span className="rounded-full bg-red-500/15 border border-red-500/30 px-2 py-0.5 text-[10px] font-semibold text-red-400">
                  AI RAG
                </span>
              </div>
              <span className="text-[11px] text-zinc-400">
                Talk to any video in seconds
              </span>
            </div>
          </Link>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            {/* Backend Health Badge */}
            <div
              className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                backendOnline === true
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                  : backendOnline === false
                  ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
                  : "border-zinc-700 bg-zinc-800/50 text-zinc-400"
              }`}
              title={
                backendOnline === true
                  ? "FastAPI RAG Backend is connected"
                  : backendOnline === false
                  ? "FastAPI server offline - running on Client Simulation Mode"
                  : "Checking backend status..."
              }
            >
              <span className="relative flex h-2 w-2">
                {backendOnline === true && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                )}
                <span
                  className={`relative inline-flex h-2 w-2 rounded-full ${
                    backendOnline === true
                      ? "bg-emerald-500"
                      : backendOnline === false
                      ? "bg-amber-500"
                      : "bg-zinc-500"
                  }`}
                />
              </span>
              <span className="hidden sm:inline">
                {backendOnline === true
                  ? "Engine Online"
                  : backendOnline === false
                  ? "Demo Mode (Offline)"
                  : "Connecting..."}
              </span>
            </div>

            {/* Quick Help Dialog Trigger */}
            <button
              onClick={() => setShowHelp(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
              title="How it works"
            >
              <HelpCircle className="h-4 w-4" />
            </button>

            {/* New Video Button */}
            <Link
              href="/"
              className="flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/20 px-3 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-500/30 hover:text-white transition-all shadow-sm"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>New Video</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Quick Help Modal */}
      {showHelp && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in"
          onClick={() => setShowHelp(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl border border-white/15 bg-zinc-900/95 p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-red-400" />
                <h3 className="text-lg font-bold text-white">How YouTubeChat Works</h3>
              </div>
              <button
                onClick={() => setShowHelp(false)}
                className="text-zinc-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>
            <div className="mt-4 space-y-3 text-sm text-zinc-300">
              <div className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500/20 text-xs font-bold text-red-400">
                  1
                </span>
                <p>
                  <strong className="text-white">Paste YouTube link</strong>: Any public YouTube video, short, or lecture with captions.
                </p>
              </div>
              <div className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500/20 text-xs font-bold text-red-400">
                  2
                </span>
                <p>
                  <strong className="text-white">AI Vector Indexing</strong>: Transcripts are chunked, converted to semantic vectors using Gemini embeddings and FAISS.
                </p>
              </div>
              <div className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500/20 text-xs font-bold text-red-400">
                  3
                </span>
                <p>
                  <strong className="text-white">Instant Answers with Timestamps</strong>: Ask anything! Click cited timestamps to jump the player straight to that moment.
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowHelp(false)}
                className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-500 transition-colors"
              >
                Got it
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
