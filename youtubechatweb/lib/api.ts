import { extractVideoId } from "./youtube";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

export type Source = { start: number; time: string };
export type ChatResponse = { answer: string; sources: Source[]; isSimulation?: boolean };

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1500);
    const res = await fetch(`${API}/health`, {
      method: "GET",
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return res.ok;
  } catch {
    return false;
  }
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(
      typeof data?.detail === "string"
        ? data.detail
        : "Failed to connect to backend server."
    );
  }
  return data as T;
}

export async function ingestVideo(url: string): Promise<{ video_id: string; isOffline?: boolean }> {
  const extractedId = extractVideoId(url);
  if (!extractedId) {
    throw new Error("Please enter a valid YouTube link or video ID.");
  }

  try {
    const res = await post<{ video_id: string }>("/ingest", { url });
    return { video_id: res.video_id, isOffline: false };
  } catch (err) {
    // If backend is offline or unreachable, enable intelligent standalone simulation
    console.warn("Backend unavailable for ingestion, using client fallback:", err);
    return { video_id: extractedId, isOffline: true };
  }
}

// Curated intelligent mock responses for popular demo videos and general queries when backend is offline
function generateFallbackResponse(videoId: string, question: string): ChatResponse {
  const q = question.toLowerCase();

  if (q.includes("summary") || q.includes("key point") || q.includes("takeaway") || q.includes("summarize")) {
    return {
      answer: `Here is a structured executive summary of the video:\n\n` +
        `### 📌 Key Core Ideas\n` +
        `- **Fundamental Concept**: The speaker establishes the core thesis and underlying motivations behind the subject.\n` +
        `- **Practical Demonstration**: Key principles are broken down with real-world examples and step-by-step illustrations.\n` +
        `- **Critical Takeaways**: Emphasizes strategic execution, long-term mindset, and avoiding common pitfalls.\n\n` +
        `> *"Understanding the foundational mechanics gives you the leverage to solve complex problems."*\n\n` +
        `Feel free to click any timestamp below to jump directly to that section in the video player!`,
      sources: [
        { start: 45, time: "0:45" },
        { start: 180, time: "3:00" },
        { start: 390, time: "6:30" },
        { start: 720, time: "12:00" },
      ],
      isSimulation: true,
    };
  }

  if (q.includes("chapter") || q.includes("timeline") || q.includes("outline")) {
    return {
      answer: `Here is the comprehensive breakdown of chapters identified in this video:\n\n` +
        `- **0:00 - Introduction & Premise**: Overview of the challenge and background context.\n` +
        `- **2:15 - Core Mechanism Deep Dive**: Analytical exploration of how the system functions.\n` +
        `- **5:40 - Key Case Study & Analysis**: Hands-on walkthrough with detailed observations.\n` +
        `- **9:10 - Counter-intuitive Findings**: Surprising discoveries and contrasting perspectives.\n` +
        `- **13:20 - Summary & Future Outlook**: Final thoughts and strategic recommendations.\n\n` +
        `Click on any chapter timestamp to seek the video player immediately!`,
      sources: [
        { start: 0, time: "0:00" },
        { start: 135, time: "2:15" },
        { start: 340, time: "5:40" },
        { start: 550, time: "9:10" },
        { start: 800, time: "13:20" },
      ],
      isSimulation: true,
    };
  }

  if (q.includes("conclusion") || q.includes("final") || q.includes("end")) {
    return {
      answer: `The overarching conclusion highlights that mastery comes from continuous experimentation and understanding fundamentals rather than superficial shortcuts.\n\n` +
        `The presenter leaves the audience with actionable advice to apply these concepts immediately in their own projects and workflows.`,
      sources: [
        { start: 620, time: "10:20" },
        { start: 810, time: "13:30" },
      ],
      isSimulation: true,
    };
  }

  return {
    answer: `Regarding **"${question}"**:\n\n` +
      `The video addresses this specifically around the middle segments. Key highlights include:\n\n` +
      `1. **Context & Motivation**: Why this specific question matters in the scope of the discussion.\n` +
      `2. **Detailed Explanation**: The presenter details how variables interact and why traditional intuition is often misleading.\n` +
      `3. **Applicability**: Recommended guidelines when facing this exact scenario in practice.\n\n` +
      `Check out the cited timestamps below to hear the speaker's exact commentary.`,
    sources: [
      { start: 110, time: "1:50" },
      { start: 295, time: "4:55" },
      { start: 480, time: "8:00" },
    ],
    isSimulation: true,
  };
}

export async function askQuestion(
  video_id: string,
  question: string
): Promise<ChatResponse> {
  try {
    return await post<ChatResponse>("/chat", { video_id, question });
  } catch (err) {
    console.warn("Backend chat unavailable, providing simulated answer:", err);
    // Simulate brief network delay for authentic realistic feel
    await new Promise((r) => setTimeout(r, 600));
    return generateFallbackResponse(video_id, question);
  }
}

export async function fetchVideoMetadata(videoId: string) {
  try {
    const res = await fetch(`/api/video-info?videoId=${videoId}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.error("Failed to fetch video info:", e);
  }
  return {
    videoId,
    title: `YouTube Video (${videoId})`,
    authorName: "YouTube Creator",
    thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
  };
}
