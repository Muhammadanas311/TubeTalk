import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get("videoId");

  if (!videoId || !/^[0-9A-Za-z_-]{11}$/.test(videoId)) {
    return NextResponse.json({ error: "Invalid video ID" }, { status: 400 });
  }

  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const res = await fetch(oembedUrl, {
      next: { revalidate: 3600 },
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json({
        videoId,
        title: data.title || `YouTube Video (${videoId})`,
        authorName: data.author_name || "YouTube Creator",
        authorUrl: data.author_url || "",
        thumbnailUrl:
          data.thumbnail_url || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      });
    }
  } catch (err) {
    console.error("Error fetching oEmbed info:", err);
  }

  // Fallback metadata if oembed is unavailable
  return NextResponse.json({
    videoId,
    title: `YouTube Video (${videoId})`,
    authorName: "YouTube Creator",
    authorUrl: "",
    thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
  });
}
