"use client";

import { useState, useRef, useEffect, type FormEvent } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Send,
  Download,
  Trash2,
  ArrowDown,
  ArrowLeft,
  Tv,
  MessageSquare,
  Loader2,
  Share2,
  Check,
  RefreshCw,
  HelpCircle,
} from "lucide-react";

import { askQuestion, fetchVideoMetadata, type Source, type ChatResponse } from "@/lib/api";
import { VideoPlayer, type VideoPlayerRef } from "@/components/video-player";
import { ChatMessage } from "@/components/chat-message";
import { SuggestedPrompts } from "@/components/suggested-prompts";
import { saveRecentVideo } from "@/components/recent-videos";

interface Message {
  role: "user" | "assistant";
  text: string;
  sources?: Source[];
  isSimulation?: boolean;
}

interface ChatViewProps {
  videoId: string;
}

export default function ChatView({ videoId }: ChatViewProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [videoMeta, setVideoMeta] = useState<{
    title: string;
    authorName: string;
    thumbnailUrl: string;
  }>({
    title: `YouTube Video (${videoId})`,
    authorName: "YouTube Creator",
    thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
  });

  // Mobile tab state: "player" or "chat"
  const [mobileTab, setMobileTab] = useState<"player" | "chat">("chat");

  const [copiedLink, setCopiedLink] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  const playerRef = useRef<VideoPlayerRef>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Fetch video metadata on load
  useEffect(() => {
    fetchVideoMetadata(videoId).then((meta) => {
      if (meta) {
        setVideoMeta({
          title: meta.title || `YouTube Video (${videoId})`,
          authorName: meta.authorName || "YouTube Creator",
          thumbnailUrl: meta.thumbnailUrl || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        });
        saveRecentVideo(videoId, meta.title);
      }
    });
  }, [videoId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Handle scroll detection for scroll-to-bottom button
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isUp = scrollHeight - scrollTop - clientHeight > 150;
    setShowScrollBottom(isUp);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Seek video player to timestamp
  const handleSeek = (seconds: number) => {
    playerRef.current?.seekTo(seconds);
    // On mobile, switch to player view so the user can see the video playing
    if (window.innerWidth < 1024) {
      setMobileTab("player");
    }
  };

  async function handleSend(textToSend?: string) {
    const question = (textToSend || input).trim();
    if (!question || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: question }]);
    setLoading(true);

    try {
      const res: ChatResponse = await askQuestion(videoId, question);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: res.answer,
          sources: res.sources,
          isSimulation: res.isSimulation,
        },
      ]);
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Something went wrong fetching the answer.";
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: `⚠️ **Error**: ${errorMsg}\n\nPlease verify that the YouTube link has accessible English captions or try again.`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  // Export conversation as Markdown
  const handleExport = () => {
    if (messages.length === 0) return;

    let content = `# YouTube Chat AI - Notes for Video: ${videoMeta.title}\n`;
    content += `URL: https://www.youtube.com/watch?v=${videoId}\n`;
    content += `Exported: ${new Date().toLocaleString()}\n\n---\n\n`;

    messages.forEach((m, idx) => {
      content += `### ${m.role === "user" ? "👤 Question" : "🤖 Assistant"}\n\n`;
      content += `${m.text}\n\n`;
      if (m.sources && m.sources.length > 0) {
        content += `**Citations**: ${m.sources
          .map((s) => `[${s.time}](https://youtu.be/${videoId}?t=${s.start})`)
          .join(", ")}\n\n`;
      }
    });

    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `youtube-chat-${videoId}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Clear chat
  const handleClear = () => {
    if (window.confirm("Are you sure you want to clear the conversation?")) {
      setMessages([]);
    }
  };

  // Share link
  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (e) {}
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full flex-col overflow-hidden">
      {/* Mobile Tab Selector */}
      <div className="flex lg:hidden border-b border-white/10 bg-zinc-950 px-4 py-2">
        <div className="flex w-full rounded-xl bg-zinc-900 p-1 border border-white/5">
          <button
            onClick={() => setMobileTab("chat")}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-all ${
              mobileTab === "chat"
                ? "bg-red-600 text-white shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>AI Chat ({messages.length})</span>
          </button>
          <button
            onClick={() => setMobileTab("player")}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-all ${
              mobileTab === "player"
                ? "bg-red-600 text-white shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Tv className="h-3.5 w-3.5" />
            <span>Video Player</span>
          </button>
        </div>
      </div>

      {/* Main Studio Dual Pane */}
      <div className="mx-auto flex h-full w-full max-w-7xl flex-1 overflow-hidden p-2 sm:p-4 gap-4">
        {/* Left Pane: Interactive Video Deck */}
        <div
          className={`h-full flex-col gap-4 overflow-y-auto lg:flex lg:w-5/12 xl:w-1/2 ${
            mobileTab === "player" ? "flex w-full" : "hidden"
          }`}
        >
          {/* Back button & Video info bar */}
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-3 w-3" />
              <span>Back to search</span>
            </Link>

            <button
              onClick={handleShare}
              className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
              title="Share chat link"
            >
              {copiedLink ? (
                <>
                  <Check className="h-3 w-3 text-emerald-400" />
                  <span className="text-emerald-400">Link Copied</span>
                </>
              ) : (
                <>
                  <Share2 className="h-3 w-3" />
                  <span>Share</span>
                </>
              )}
            </button>
          </div>

          {/* YouTube Video Player with Seek Ref */}
          <VideoPlayer
            ref={playerRef}
            videoId={videoId}
            title={videoMeta.title}
            authorName={videoMeta.authorName}
          />

          {/* Suggested Prompts Deck */}
          <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-3.5 backdrop-blur-md shadow-lg">
            <SuggestedPrompts
              onSelect={(prompt) => {
                handleSend(prompt);
                if (window.innerWidth < 1024) setMobileTab("chat");
              }}
              disabled={loading}
            />
          </div>

          {/* Sync Tip Notice */}
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-xs text-zinc-300 flex items-start gap-2.5">
            <Sparkles className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="text-white">Live Time Sync:</strong> When the AI responds with timestamp pills (e.g., <span className="text-red-400 font-mono">03:45</span>), click them to automatically seek the embedded player directly to that second!
            </p>
          </div>
        </div>

        {/* Right Pane: AI Dialogue Console */}
        <div
          className={`relative flex h-full flex-1 flex-col overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/70 backdrop-blur-xl shadow-2xl ${
            mobileTab === "chat" ? "flex w-full" : "hidden lg:flex"
          }`}
        >
          {/* Chat Console Header */}
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-white/10 px-4">
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-xs sm:text-sm font-semibold text-white">
                  {videoMeta.title}
                </h3>
                <span className="text-[11px] text-zinc-400">
                  {messages.length} {messages.length === 1 ? "turn" : "turns"} in conversation
                </span>
              </div>
            </div>

            {/* Actions: Export & Clear */}
            <div className="flex items-center gap-1.5 shrink-0">
              {messages.length > 0 && (
                <>
                  <button
                    onClick={handleExport}
                    className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
                    title="Export conversation as Markdown"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Export</span>
                  </button>

                  <button
                    onClick={handleClear}
                    className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-zinc-400 hover:bg-red-500/20 hover:text-red-300 transition-colors"
                    title="Clear chat"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Chat Messages Stream */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto p-4 space-y-4"
          >
            {/* Empty state welcome card */}
            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="mx-auto my-auto flex max-w-md flex-col items-center justify-center text-center py-8 px-4"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-rose-700 text-white shadow-xl shadow-red-500/25 mb-4">
                  <Sparkles className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-bold text-white">
                  Ask anything about this video
                </h3>
                <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed max-w-sm">
                  Our semantic index has processed this video transcript. Query concepts, ask for summaries, or click any suggested question below.
                </p>

                <div className="mt-6 w-full text-left">
                  <SuggestedPrompts onSelect={(q) => handleSend(q)} disabled={loading} />
                </div>
              </motion.div>
            )}

            {/* Message List */}
            {messages.map((m, i) => (
              <ChatMessage
                key={i}
                role={m.role}
                text={m.text}
                sources={m.sources}
                isSimulation={m.isSimulation}
                onSeek={handleSeek}
              />
            ))}

            {/* Thinking / Searching Wave Indicator */}
            {loading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 py-2 text-zinc-400"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-500/20 text-red-400 border border-red-500/30">
                  <Sparkles className="h-4 w-4 animate-spin" />
                </div>
                <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-zinc-900/90 px-4 py-2.5 backdrop-blur-md">
                  <div className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-red-500 animate-bounce [animation-delay:-0.3s]" />
                    <span className="h-2 w-2 rounded-full bg-red-400 animate-bounce [animation-delay:-0.15s]" />
                    <span className="h-2 w-2 rounded-full bg-red-300 animate-bounce" />
                  </div>
                  <span className="text-xs text-zinc-300 font-medium">
                    Analyzing transcript & finding timestamps...
                  </span>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Floating Scroll-to-Bottom Pill */}
          <AnimatePresence>
            {showScrollBottom && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={scrollToBottom}
                className="absolute bottom-20 right-6 flex items-center gap-1.5 rounded-full border border-white/15 bg-zinc-800/90 px-3 py-1.5 text-xs text-zinc-200 shadow-xl backdrop-blur-md hover:bg-zinc-700 transition-colors z-20"
              >
                <ArrowDown className="h-3.5 w-3.5" />
                <span>Scroll to bottom</span>
              </motion.button>
            )}
          </AnimatePresence>

          {/* Input Dock */}
          <div className="border-t border-white/10 bg-zinc-950/80 p-3 sm:p-4 backdrop-blur-md">
            <form
              onSubmit={(e: FormEvent) => {
                e.preventDefault();
                handleSend();
              }}
              className="relative flex items-center rounded-2xl border border-white/15 bg-zinc-900/90 p-1.5 shadow-inner transition-all focus-within:border-red-500/50 focus-within:ring-2 focus-within:ring-red-500/20"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about this video... (e.g. 'What is the main takeaway?')"
                maxLength={500}
                disabled={loading}
                className="w-full bg-transparent px-3 py-2 text-xs sm:text-sm text-white placeholder-zinc-500 outline-none"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-md shadow-red-600/30 hover:brightness-110 active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <span className="hidden sm:inline">Send</span>
                    <Send className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </form>
            <div className="mt-1.5 flex items-center justify-between px-2 text-[11px] text-zinc-500">
              <span>Press Enter to send</span>
              <span>{input.length}/500</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
