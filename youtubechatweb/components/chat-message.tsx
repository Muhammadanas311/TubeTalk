"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import {
  Sparkles,
  User,
  Copy,
  Check,
  Volume2,
  VolumeX,
  Play,
  Share2,
} from "lucide-react";
import type { Source } from "@/lib/api";

interface ChatMessageProps {
  role: "user" | "assistant";
  text: string;
  sources?: Source[];
  onSeek?: (seconds: number) => void;
  isSimulation?: boolean;
}

export function ChatMessage({
  role,
  text,
  sources,
  onSeek,
  isSimulation,
}: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleSpeak = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    // Strip markdown formatting for cleaner speech
    const cleanText = text
      .replace(/[#*_`>\[\]]/g, "")
      .replace(/\(http[^)]+\)/g, "");

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`flex w-full gap-3 py-2 ${
        role === "user" ? "justify-end" : "justify-start"
      }`}
    >
      {/* Assistant Avatar */}
      {role === "assistant" && (
        <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-rose-700 shadow-md shadow-red-500/20 text-white mt-0.5">
          <Sparkles className="h-4 w-4" />
        </div>
      )}

      {/* Message Content Container */}
      <div
        className={`relative group max-w-[88%] sm:max-w-[80%] rounded-2xl px-4 py-3 shadow-lg ${
          role === "user"
            ? "border border-red-500/30 bg-gradient-to-r from-red-600 to-rose-600 text-white"
            : "border border-white/10 bg-zinc-900/90 text-zinc-100 backdrop-blur-md"
        }`}
      >
        {/* Simulation Mode Tag */}
        {role === "assistant" && isSimulation && (
          <div className="mb-2 flex items-center gap-1.5 text-[10px] font-medium text-amber-400">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            <span>Interactive Demo Response</span>
          </div>
        )}

        {/* Text body */}
        {role === "user" ? (
          <p className="whitespace-pre-wrap text-sm leading-relaxed font-normal">
            {text}
          </p>
        ) : (
          <div className="prose prose-invert prose-sm max-w-none space-y-2 text-zinc-200 leading-relaxed break-words">
            <ReactMarkdown
              components={{
                h1: ({ ...props }) => (
                  <h1 className="text-base font-bold text-white mt-2 mb-1" {...props} />
                ),
                h2: ({ ...props }) => (
                  <h2 className="text-sm font-semibold text-white mt-2 mb-1" {...props} />
                ),
                h3: ({ ...props }) => (
                  <h3 className="text-xs font-semibold text-zinc-100 mt-1 mb-0.5" {...props} />
                ),
                p: ({ ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                ul: ({ ...props }) => (
                  <ul className="list-disc pl-4 space-y-1 mb-2" {...props} />
                ),
                ol: ({ ...props }) => (
                  <ol className="list-decimal pl-4 space-y-1 mb-2" {...props} />
                ),
                li: ({ ...props }) => <li className="text-zinc-300" {...props} />,
                blockquote: ({ ...props }) => (
                  <blockquote
                    className="border-l-2 border-red-500/60 bg-red-500/5 pl-3 py-1 italic text-zinc-300 rounded-r my-2"
                    {...props}
                  />
                ),
                code: ({ ...props }) => (
                  <code
                    className="rounded bg-black/40 px-1.5 py-0.5 font-mono text-xs text-red-300 border border-white/5"
                    {...props}
                  />
                ),
              }}
            >
              {text}
            </ReactMarkdown>
          </div>
        )}

        {/* Timestamp Sources Badges */}
        {role === "assistant" && sources && sources.length > 0 && (
          <div className="mt-3.5 pt-2.5 border-t border-white/10">
            <div className="flex items-center gap-1.5 mb-1.5 text-[11px] font-medium text-zinc-400">
              <Play className="h-3 w-3 text-red-400 fill-red-400" />
              <span>Referenced Timestamps (click to seek):</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {sources.map((s, idx) => (
                <button
                  key={`${s.start}-${idx}`}
                  type="button"
                  onClick={() => onSeek?.(s.start)}
                  className="group/btn flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-300 hover:border-red-500/70 hover:bg-red-500/20 hover:text-white transition-all shadow-sm active:scale-95"
                >
                  <Play className="h-2.5 w-2.5 text-red-400 group-hover/btn:fill-red-400" />
                  <span>{s.time}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Assistant Bottom Actions (Copy, TTS) */}
        {role === "assistant" && (
          <div className="mt-2.5 flex items-center justify-end gap-1 text-zinc-400 opacity-80 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={handleSpeak}
              className={`flex items-center gap-1 rounded-md px-2 py-1 text-[11px] transition-colors ${
                isSpeaking
                  ? "bg-red-500/20 text-red-300 font-medium"
                  : "hover:bg-white/5 hover:text-zinc-200"
              }`}
              title={isSpeaking ? "Stop listening" : "Read aloud"}
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="h-3.5 w-3.5 text-red-400" />
                  <span>Stop</span>
                </>
              ) : (
                <>
                  <Volume2 className="h-3.5 w-3.5" />
                  <span>Listen</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] hover:bg-white/5 hover:text-zinc-200 transition-colors"
              title="Copy to clipboard"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* User Avatar */}
      {role === "user" && (
        <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-xl bg-zinc-800 text-zinc-300 border border-white/10 mt-0.5">
          <User className="h-4 w-4" />
        </div>
      )}
    </motion.div>
  );
}
