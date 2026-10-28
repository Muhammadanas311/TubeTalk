"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import {
  Sparkles,
  ArrowRight,
  Clipboard,
  Check,
  AlertCircle,
  Loader2,
  Clock,
  Layers,
  Search,
  Volume2,
  Share2,
} from "lucide-react";
import { YoutubeIcon } from "@/components/icons";

import { ingestVideo } from "@/lib/api";
import { extractVideoId, getYoutubeThumbnail } from "@/lib/youtube";
import { DemoCards } from "@/components/demo-cards";
import { RecentVideos, saveRecentVideo } from "@/components/recent-videos";

const LOADING_STAGES = [
  "Resolving video stream & metadata...",
  "Extracting timestamped transcript snippets...",
  "Computing semantic vector embeddings...",
  "Synchronizing playback studio...",
];

export default function Home() {
  const [url, setUrl] = useState("");
  const [detectedId, setDetectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  const [error, setError] = useState("");
  const [pasted, setPasted] = useState(false);
  const router = useRouter();

  // Live video ID detection for instant preview
  useEffect(() => {
    const id = extractVideoId(url);
    setDetectedId(id);
    if (id) setError("");
  }, [url]);

  // Rotate loading stages for rich visual feedback
  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setLoadingStage((prev) => (prev < LOADING_STAGES.length - 1 ? prev + 1 : prev));
    }, 1200);
    return () => clearInterval(interval);
  }, [loading]);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text);
        setPasted(true);
        setTimeout(() => setPasted(false), 1500);
      }
    } catch {
      // Clipboard permissions denied
    }
  };

  async function handleSubmit(targetUrl?: string) {
    const inputUrl = targetUrl || url;
    if (!inputUrl.trim() || loading) return;

    setError("");
    setLoading(true);
    setLoadingStage(0);

    try {
      const result = await ingestVideo(inputUrl);
      saveRecentVideo(result.video_id);

      // Trigger celebratory confetti burst
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ["#ef4444", "#f43f5e", "#8b5cf6", "#06b6d4"],
        });
      } catch {}

      // Short delay for user to appreciate completion
      setTimeout(() => {
        router.push(`/chat/${result.video_id}`);
      }, 600);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze video. Please check the URL.");
      setLoading(false);
    }
  }

  const handleDemoSelect = (videoId: string) => {
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    setUrl(videoUrl);
    handleSubmit(videoUrl);
  };

  return (
    <main className="relative flex flex-col items-center justify-start px-4 pt-10 pb-20 sm:px-6">
      {/* Hero Badge */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-5 inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3.5 py-1 text-xs font-semibold text-red-300 backdrop-blur-md shadow-sm"
      >
        <Sparkles className="h-3.5 w-3.5 text-red-400" />
        <span>Next-Gen Semantic Video Intelligence</span>
      </motion.div>

      {/* Hero Headings */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="max-w-3xl text-center space-y-4"
      >
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
          Chat with any{" "}
          <span className="bg-gradient-to-r from-red-500 via-rose-500 to-red-400 bg-clip-text text-transparent">
            YouTube Video
          </span>
        </h1>
        <p className="mx-auto max-w-2xl text-base sm:text-lg text-zinc-400 leading-relaxed">
          Ask questions, extract executive summaries, and navigate content with precision.
          Every answer includes clickable timestamps that jump straight to the source.
        </p>
      </motion.div>

      {/* Main Input Dock */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-8 w-full max-w-2xl"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="relative rounded-2xl border border-white/15 bg-zinc-900/80 p-2 shadow-2xl backdrop-blur-xl transition-all focus-within:border-red-500/50 focus-within:ring-2 focus-within:ring-red-500/20"
        >
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="flex flex-1 items-center gap-2.5 px-3 py-1">
              <YoutubeIcon className="h-5 w-5 text-red-500 shrink-0" />
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste any YouTube URL or Video ID (e.g. youtu.be/...)"
                disabled={loading}
                className="w-full bg-transparent text-sm text-white placeholder-zinc-500 outline-none"
              />
              {url && (
                <button
                  type="button"
                  onClick={() => setUrl("")}
                  disabled={loading}
                  className="text-xs text-zinc-500 hover:text-white px-1"
                >
                  ✕
                </button>
              )}
              {!url && (
                <button
                  type="button"
                  onClick={handlePaste}
                  className="flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
                  title="Paste from clipboard"
                >
                  {pasted ? (
                    <Check className="h-3 w-3 text-emerald-400" />
                  ) : (
                    <Clipboard className="h-3 w-3" />
                  )}
                  <span className="hidden sm:inline">Paste</span>
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-600/30 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>Start Chatting</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>

          {/* Detected Video Preview Ribbon */}
          <AnimatePresence>
            {detectedId && !loading && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2.5 flex items-center gap-3 border-t border-white/10 pt-2.5 px-2"
              >
                <div className="relative h-10 w-16 overflow-hidden rounded-md bg-black">
                  <img
                    src={getYoutubeThumbnail(detectedId)}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                    <Check className="h-3 w-3" />
                    <span>Valid YouTube video detected</span>
                  </div>
                  <div className="text-[11px] font-mono text-zinc-400 truncate">
                    ID: {detectedId}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Animated Loading Stages Banner */}
          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 flex items-center gap-3 border-t border-white/10 pt-3 px-2 text-xs text-red-300"
              >
                <Loader2 className="h-4 w-4 animate-spin text-red-400 shrink-0" />
                <span className="font-medium animate-pulse">
                  {LOADING_STAGES[loadingStage]}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="mt-3 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300"
            >
              <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Featured Demo Video Cards */}
      <div className="mt-12 w-full flex justify-center">
        <DemoCards onSelect={handleDemoSelect} loading={loading} />
      </div>

      {/* Recent Explored Videos from Local Storage */}
      <div className="mt-8 w-full flex justify-center">
        <RecentVideos />
      </div>

      {/* Platform Features Grid */}
      <div className="mt-16 w-full max-w-4xl space-y-4">
        <div className="text-center space-y-1">
          <h3 className="text-lg font-bold text-white">Why YouTubeChat AI?</h3>
          <p className="text-xs text-zinc-400">
            Engineered with modern RAG principles for speed, depth, and precision.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            whileHover={{ y: -3 }}
            className="rounded-2xl border border-white/10 bg-zinc-900/50 p-5 backdrop-blur-md space-y-2.5"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
              <Search className="h-5 w-5" />
            </div>
            <h4 className="font-semibold text-white text-sm">Semantic Retrieval</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Finds ideas based on concept and meaning, not just keyword matches, using dense vector embeddings.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -3 }}
            className="rounded-2xl border border-white/10 bg-zinc-900/50 p-5 backdrop-blur-md space-y-2.5"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Clock className="h-5 w-5" />
            </div>
            <h4 className="font-semibold text-white text-sm">Synced Timestamps</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Every insight is tagged with exact time citations. Click any timecode to jump the video directly.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -3 }}
            className="rounded-2xl border border-white/10 bg-zinc-900/50 p-5 backdrop-blur-md space-y-2.5"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Volume2 className="h-5 w-5" />
            </div>
            <h4 className="font-semibold text-white text-sm">Interactive Studio</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Read aloud answers with voice synthesis, export dialogue to Markdown, and explore suggested prompts.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-20 border-t border-white/10 pt-6 text-center text-xs text-zinc-500 w-full max-w-4xl">
        <p>
          YouTubeChat Studio • Powered by Next.js 16 Turbopack, FastAPI, LangChain & Gemini Embeddings
        </p>
      </footer>
    </main>
  );
}
