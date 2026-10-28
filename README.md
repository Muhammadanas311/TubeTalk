# YouTube Chat (RAG)

Paste a YouTube link and chat with the video using Retrieval-Augmented Generation. Answers are derived strictly from the video's transcript and include clickable timestamps.

## Features

- **Retrieval-Augmented Generation (RAG)**: Chunks and embeds YouTube transcripts for targeted similarity search.
- **Clickable Timestamps**: Answers cite exact moments in the video with jump-to links.
- **Prompt Injection Defense**: Guardrailed system prompts that treat video transcripts as untrusted reference data.
- **Cached Vector Indexes**: FAISS indexes are cached per video ID to eliminate redundant transcript downloads and embeddings.
- **Modern UI**: Built with Next.js 16, TypeScript, Tailwind CSS, and shadcn/ui.

## Tech Stack

- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS, Lucide Icons
- **Backend**: FastAPI, LangChain, FAISS (CPU)
- **AI Models**: Google Gemini (`models/gemini-embedding-001` for embeddings), Groq LLM for fast inference

## Prerequisites

- **Python**: 3.12+
- **Node.js**: 18+ (LTS recommended)
- **API Keys**:
  - [Google AI Studio API Key](https://aistudio.google.com/) (Gemini embeddings)
  - [Groq API Key](https://console.groq.com/) (LLM inference)

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/YoutubeChat.git
cd YoutubeChat
```

### 2. Backend Setup

```bash
cd youtubechatbackend

# Create virtual environment
py -3.12 -m venv venv

# Activate virtual environment
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# Windows (CMD):
venv\Scripts\activate.bat
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env and paste your GOOGLE_API_KEY and GROQ_API_KEY

# Start backend server
uvicorn main:app --reload --port 8000
```

The FastAPI backend will be running at `http://127.0.0.1:8000`. You can test health at `http://127.0.0.1:8000/health`.

### 3. Frontend Setup

In a new terminal window:

```bash
cd youtubechatweb

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Known Limitations

- **YouTube Transcript Restrictions**: YouTube occasionally blocks automated transcript requests from cloud datacenter IPs. The backend works best when run locally on a residential IP. A Chrome extension to fetch transcripts client-side in the user's browser is planned.

## Roadmap

- [ ] Chrome extension for client-side transcript extraction
- [ ] Streaming LLM responses (SSE)
- [ ] Multi-turn conversation memory
- [ ] Rate limiting & user authentication

## License

This project is licensed under the [MIT License](LICENSE).
