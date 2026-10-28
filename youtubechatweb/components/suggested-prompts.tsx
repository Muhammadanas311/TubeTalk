"use client";

import { motion } from "framer-motion";
import { Sparkles, Lightbulb, Clock, Target, HelpCircle, BookOpen } from "lucide-react";

interface SuggestedPromptsProps {
  onSelect: (prompt: string) => void;
  disabled?: boolean;
}

const PROMPTS = [
  {
    icon: Lightbulb,
    label: "Key Takeaways",
    text: "Summarize the key takeaways and main points in 3-4 concise bullets.",
  },
  {
    icon: Clock,
    label: "Video Chapters",
    text: "Provide a chronological timeline breakdown of the key chapters and topics discussed.",
  },
  {
    icon: Target,
    label: "Main Thesis",
    text: "What is the core argument or thesis of this video and what evidence supports it?",
  },
  {
    icon: BookOpen,
    label: "Actionable Steps",
    text: "What actionable advice, techniques, or practical steps are recommended in this video?",
  },
];

export function SuggestedPrompts({ onSelect, disabled }: SuggestedPromptsProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-400">
        <Sparkles className="h-3.5 w-3.5 text-red-400" />
        <span>Suggested Questions</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {PROMPTS.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.button
              key={item.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.2 }}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(item.text)}
              className="flex items-start gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] p-2.5 text-left text-xs text-zinc-300 hover:border-red-500/40 hover:bg-white/[0.08] hover:text-white transition-all disabled:opacity-50 active:scale-[0.98]"
            >
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-400">
                <Icon className="h-3.5 w-3.5" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-zinc-200">{item.label}</div>
                <div className="line-clamp-1 text-[11px] text-zinc-400">
                  {item.text}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
