"use client";

import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from "react";
import { Play, ExternalLink, Clock, Sparkles } from "lucide-react";
import { formatSeconds } from "@/lib/youtube";

export interface VideoPlayerRef {
  seekTo: (seconds: number) => void;
}

interface VideoPlayerProps {
  videoId: string;
  title?: string;
  authorName?: string;
}

export const VideoPlayer = forwardRef<VideoPlayerRef, VideoPlayerProps>(
  function VideoPlayer({ videoId, title, authorName }, ref) {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [lastJumpedTime, setLastJumpedTime] = useState<number | null>(null);

    const seekTo = (seconds: number) => {
      setLastJumpedTime(seconds);
      if (iframeRef.current && iframeRef.current.contentWindow) {
        // Send official YouTube postMessage commands
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({
            event: "command",
            func: "seekTo",
            args: [seconds, true],
          }),
          "*"
        );
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({
            event: "command",
            func: "playVideo",
            args: [],
          }),
          "*"
        );
      }
    };

    useImperativeHandle(ref, () => ({
      seekTo,
    }));

    useEffect(() => {
      if (lastJumpedTime !== null) {
        const timer = setTimeout(() => setLastJumpedTime(null), 3500);
        return () => clearTimeout(timer);
      }
    }, [lastJumpedTime]);

    return (
      <div className="flex flex-col gap-3">
        {/* Frame container */}
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-black/80 shadow-2xl">
          <iframe
            ref={iframeRef}
            src={`https://www.youtube-nocookie.com/embed/${videoId}?enablejsapi=1&rel=0&modestbranding=1`}
            title={title || "YouTube video player"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="h-full w-full border-0"
          />

          {/* Jump Notification Overlay */}
          {lastJumpedTime !== null && (
            <div className="pointer-events-none absolute bottom-4 left-4 z-20 flex items-center gap-2 rounded-xl border border-red-500/40 bg-zinc-950/90 px-3 py-1.5 text-xs font-semibold text-white shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2">
              <span className="flex h-2 w-2 rounded-full bg-red-500 animate-ping" />
              <Play className="h-3 w-3 text-red-400 fill-red-400" />
              <span>Seeking to {formatSeconds(lastJumpedTime)}</span>
            </div>
          )}
        </div>

        {/* Video Metadata & External Links */}
        <div className="flex items-start justify-between gap-4 px-1">
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-base font-semibold text-white">
              {title || "YouTube Video"}
            </h2>
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <span className="font-medium text-zinc-300">{authorName || "YouTube Creator"}</span>
              <span>•</span>
              <span className="font-mono text-zinc-500">{videoId}</span>
            </div>
          </div>

          <a
            href={`https://www.youtube.com/watch?v=${videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
          >
            <span>Watch on YouTube</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    );
  }
);
