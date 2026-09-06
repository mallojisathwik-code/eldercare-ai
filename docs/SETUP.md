# Setup Guide

## Prerequisites

- Node.js 18+ and npm
- A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) account
- A free [Groq](https://console.groq.com) API key (used for both Whisper STT and the LLM chat)

## 1. MongoDB Atlas

1. Create a free cluster (M0 tier).
2. Database Access → add a user with a password.
3. Network Access → add `0.0.0.0/0` for local dev (tighten before any real deployment).
4. Get your connection string: `mongodb+srv://<user>:<password>@cluster.mongodb.net/eldercare`
5. If you hit `querySrv ECONNREFUSED`, see `docs/KNOWN_ISSUES.md` #1 before debugging further — it's almost always DNS.

## 2. Groq API Key

1. Sign up at console.groq.com, create an API key.
2. Free tier covers both the Whisper transcription endpoint and Llama chat completion endpoint used here.

## 3. Backend

```bash
cd server
npm install
cp .env.example .env
```

Edit `server/.env`:
```
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/eldercare
GROQ_API_KEY=gsk_...
CLIENT_URL=http://localhost:5173
```

```bash
npm run dev
```

You should see: `✅ MongoDB connected` and `🚀 Server running on port 5000` with the mounted routes listed.

## 4. Frontend

```bash
cd client
npm install
cp .env.example .env
```

Edit `client/.env`:
```
VITE_API_URL=http://localhost:5000/api
```

```bash
npm run dev
```

Open `http://localhost:5173`.

## 5. Verify End-to-End

1. Open the dashboard, click the mic button on the AI Companion Card.
2. Speak a short sentence, stop recording.
3. You should see the transcript appear, then hear a spoken reply.
4. If the transcript never appears — check `docs/KNOWN_ISSUES.md` #2 for the route-mismatch checklist.
5. If you get a `404` on chat — check #3.

## Recommended Dev Setup: AI-Assisted Coding

For the actual build/debug work (not project management), this project is meant to be developed with **Claude Code** running against this repo, using this `docs/` folder as its source of truth for architecture and conventions. Point Claude Code at `docs/ARCHITECTURE.md` and `docs/KNOWN_ISSUES.md` at the start of any session so fixes aren't relitigated.
