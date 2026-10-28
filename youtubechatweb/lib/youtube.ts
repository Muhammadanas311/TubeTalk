export const VIDEO_ID_REGEX = /^[0-9A-Za-z_-]{11}$/;

export function extractVideoId(urlOrId: string): string | null {
  const trimmed = urlOrId.trim();
  if (!trimmed) return null;

  // Direct 11-character video ID
  if (VIDEO_ID_REGEX.test(trimmed)) {
    return trimmed;
  }

  try {
    const url = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    const host = url.hostname.replace("www.", "").replace("m.", "");

    if (host === "youtu.be") {
      const id = url.pathname.slice(1).split("?")[0].split("/")[0];
      return VIDEO_ID_REGEX.test(id) ? id : null;
    }

    if (host === "youtube.com") {
      if (url.pathname === "/watch") {
        const id = url.searchParams.get("v");
        return id && VIDEO_ID_REGEX.test(id) ? id : null;
      }

      const paths = url.pathname.split("/").filter(Boolean);
      if (["shorts", "embed", "live", "v"].includes(paths[0]) && paths[1]) {
        const id = paths[1].split("?")[0];
        return VIDEO_ID_REGEX.test(id) ? id : null;
      }
    }
  } catch {
    // If not a valid URL, check if there's an 11-char ID inside the string
    const match = trimmed.match(/(?:v=|\/embed\/|\/shorts\/|youtu\.be\/|\/v\/|^)([0-9A-Za-z_-]{11})/);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

export function formatSeconds(seconds: number): string {
  const totalSeconds = Math.max(0, Math.floor(seconds));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function parseSeconds(timeStr: string): number {
  const parts = timeStr.trim().split(":").map(Number);
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  return Number(timeStr) || 0;
}

export function getYoutubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

export interface VideoMetadata {
  videoId: string;
  title: string;
  authorName: string;
  authorUrl?: string;
  thumbnailUrl: string;
}
