"use client";

import { motion } from "framer-motion";
import { Play, Sparkles } from "lucide-react";

interface DemoVideo {
  id: string;
  title: string;
  creator: string;
  duration: string;
  badge: string;
}

const DEMO_VIDEOS: DemoVideo[] = [
  {
    id: "UF8uR6Z6KLc",
    title: "Steve Jobs' 2005 Stanford Commencement Address",
    creator: "Stanford University",
    duration: "15:04",
    badge: "Inspirational",
  },
  {
    id: "aircAruvnKk",
    title: "But what is a neural network? | Deep learning chapter 1",
    creator: "3Blue1Brown",
    duration: "19:13",
    badge: "AI & Math",
  },
  {
    id: "m80-Fj6q4f0",
    title: "The Simplest Math Problem No One Can Solve - Collatz Conjecture",
    creator: "Veritasium",
    duration: "22:09",
    badge: "Science",
  },
  {
    id: "zjkBMFhNj_g",
    title: "Intro to Large Language Models",
    creator: "Andrej Karpathy",
    duration: "59:45",
    badge: "Machine Learning",
  },
];

interface DemoCardsProps {
  onSelect: (videoId: string) => void;
  loading?: boolean;
}

export function DemoCards({ onSelect, loading }: DemoCardsProps) {
  return (
    <div className="w-full max-w-4xl space-y-3">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-red-400" />
          <h3 className="text-sm font-semibold text-zinc-300">
            Or try one of these featured videos
          </h3>
        </div>
        <span className="text-xs text-zinc-500">Instant 1-click test</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {DEMO_VIDEOS.map((video, index) => (
          <motion.div
            key={video.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.08, duration: 0.3 }}
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => !loading && onSelect(video.id)}
            className="group relative cursor-pointer overflow-hidden rounded-xl border border-white/10 bg-zinc-900/60 p-3 shadow-md backdrop-blur-md hover:border-red-500/40 hover:bg-zinc-800/80 transition-all"
          >
            {/* Thumbnail Preview with Duration badge */}
            <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-zinc-950">
              <img
                src={`https://img.youtube.com/vi/${video.id}/mqdefault.jpg`}
                alt={video.title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
              
              <div className="absolute top-2 left-2 rounded-md bg-black/60 backdrop-blur-md px-1.5 py-0.5 text-[10px] font-semibold text-red-300 border border-white/10">
                {video.badge}
              </div>

              <div className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-[10px] font-mono text-white">
                {video.duration}
              </div>

              {/* Play icon overlay on hover */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600/90 text-white shadow-lg backdrop-blur-sm">
                  <Play className="h-5 w-5 fill-white ml-0.5" />
                </div>
              </div>
            </div>

            {/* Video Meta */}
            <div className="mt-2.5 space-y-1">
              <h4 className="line-clamp-2 text-xs font-semibold text-white group-hover:text-red-300 transition-colors">
                {video.title}
              </h4>
              <p className="line-clamp-1 text-[11px] text-zinc-400">
                {video.creator}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
