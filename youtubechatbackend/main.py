import json
import urllib.request
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from rag import VideoError, extract_video_id, get_store, answer

app = FastAPI(title="YouTube Chat AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class IngestRequest(BaseModel):
    url: str = Field(min_length=5, max_length=200)


class ChatRequest(BaseModel):
    video_id: str = Field(pattern=r"^[0-9A-Za-z_-]{11}$")
    question: str = Field(min_length=1, max_length=500)


@app.get("/health")
def health():
    return {"status": "ok", "service": "youtube-chat-backend"}


@app.get("/info/{video_id}")
def video_info(video_id: str):
    try:
        url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={video_id}&format=json"
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return {
                "title": data.get("title", ""),
                "author_name": data.get("author_name", ""),
                "author_url": data.get("author_url", ""),
                "thumbnail_url": data.get("thumbnail_url", f"https://img.youtube.com/vi/{video_id}/hqdefault.jpg"),
                "video_id": video_id
            }
    except Exception:
        return {
            "title": f"YouTube Video ({video_id})",
            "author_name": "YouTube Creator",
            "author_url": "",
            "thumbnail_url": f"https://img.youtube.com/vi/{video_id}/hqdefault.jpg",
            "video_id": video_id
        }


@app.post("/ingest")
def ingest(req: IngestRequest):
    try:
        video_id = extract_video_id(req.url)
        get_store(video_id)
    except VideoError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {"video_id": video_id}


@app.post("/chat")
def chat(req: ChatRequest):
    try:
        return answer(req.video_id, req.question)
    except VideoError as e:
        raise HTTPException(status_code=400, detail=str(e))
