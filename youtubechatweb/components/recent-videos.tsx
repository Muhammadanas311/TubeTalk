"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { History, Trash2, ArrowUpRight } from "lucide-react";

export interface RecentVideoItem {
  videoId: string;
  title: string;
  timestamp: number;
}

const STORAGE_KEY = "ytchat_recent_videos";

export function saveRecentVideo(videoId: string, title?: string) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list: RecentVideoItem[] = raw ? JSON.parse(raw) : [];
    const filtered = list.filter((item) => item.videoId !== videoId);
    filtered.unshift({
      videoId,
      title: title || `YouTube Video (${videoId})`,
      timestamp: Date.now(),
    });
    // Keep max 8
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered.slice(0, 8)));
  } catch (e) {
    console.error("Failed to save to localStorage:", e);
  }
}

export function RecentVideos() {
  const [recents, setRecents] = useState<RecentVideoItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setRecents(JSON.parse(raw));
      }
    } catch (e) {
      console.error("Failed to read recents:", e);
    }
  }, []);

  const handleClear = () => {
    localStorage.removeItem(STORAGE_KEY);
    setRecents([]);
  };

  const handleRemove = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const updated = recents.filter((r) => r.videoId !== id);
    setRecents(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  if (!mounted || recents.length === 0) return null;

  return (
    <div className="w-full max-w-4xl space-y-3">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-zinc-400" />
          <h3 className="text-sm font-semibold text-zinc-300">
            Recently Explored
          </h3>
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-mono text-zinc-400">
            {recents.length}
          </span>
        </div>
        <button
          onClick={handleClear}
          className="flex items-center gap-1 text-xs text-zinc-500 hover:text-red-400 transition-colors"
        >
          <Trash2 className="h-3 w-3" />
          <span>Clear history</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        <AnimatePresence>
          {recents.map((item) => (
            <motion.div
              key={item.videoId}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <Link
                href={`/chat/${item.videoId}`}
                className="group relative flex flex-col overflow-hidden rounded-xl border border-white/10 bg-zinc-900/50 p-2.5 backdrop-blur-md hover:border-red-500/40 hover:bg-zinc-800/60 transition-all"
              >
                <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-zinc-950">
                  <img
                    src={`https://img.youtube.com/vi/${item.videoId}/mqdefault.jpg`}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute top-1.5 right-1.5 rounded-full bg-black/60 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowUpRight className="h-3 w-3 text-white" />
                  </div>
                </div>

                <div className="mt-2 flex items-start justify-between gap-1">
                  <h4 className="line-clamp-1 text-xs font-medium text-zinc-200 group-hover:text-red-300 transition-colors">
                    {item.title}
                  </h4>
                  <button
                    onClick={(e) => handleRemove(e, item.videoId)}
                    className="text-zinc-500 hover:text-red-400 p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove from history"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
