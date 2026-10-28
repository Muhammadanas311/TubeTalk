import { Suspense } from "react";
import { notFound } from "next/navigation";
import ChatView from "@/app/chat/[videoId]/chat-view";
import { Sparkles, Loader2 } from "lucide-react";

const VIDEO_ID_RE = /^[0-9A-Za-z_-]{11}$/;

async function ChatLoader({ params }: { params: Promise<{ videoId: string }> }) {
  const { videoId } = await params;
  if (!VIDEO_ID_RE.test(videoId)) notFound();
  return <ChatView videoId={videoId} />;
}

function StudioLoadingSkeleton() {
  return (
    <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center p-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-rose-700 shadow-xl shadow-red-500/25">
          <Sparkles className="h-8 w-8 text-white animate-pulse" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex h-4 w-4 rounded-full bg-red-500" />
          </span>
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-white">Opening Video Studio</h3>
          <p className="text-xs text-zinc-400">Loading transcript semantic index & video controls...</p>
        </div>
      </div>
    </div>
  );
}

export default function ChatPage({
  params,
}: {
  params: Promise<{ videoId: string }>;
}) {
  return (
    <Suspense fallback={<StudioLoadingSkeleton />}>
      <ChatLoader params={params} />
    </Suspense>
  );
}
