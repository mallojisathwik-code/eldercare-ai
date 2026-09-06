# EldercareAI

**AI-Powered Voice-Based Elderly Companion for Early Cognitive Wellbeing Monitoring and Family Support**

A voice-first companion system that talks with elderly users daily, tracks communication patterns over time (not medical diagnoses), and gives families a simple dashboard to stay informed — built entirely on free-tier services.

> Rebuild #2. See [`docs/KNOWN_ISSUES.md`](docs/KNOWN_ISSUES.md) for bugs already solved once — read it before touching voice/recording code, so we don't lose that ground again.

---

## Quick Start

```bash
# 1. Clone / open this folder, then install both apps
cd server && npm install
cd ../client && npm install

# 2. Configure environment
cp server/.env.example server/.env      # fill in your keys
cp client/.env.example client/.env

# 3. Run (two terminals)
cd server && npm run dev      # http://localhost:5000
cd client && npm run dev      # http://localhost:5173
```

Full setup, API keys, and MongoDB Atlas instructions: [`docs/SETUP.md`](docs/SETUP.md)

---

## Project Structure

```
eldercare-ai/
├── docs/                    # All project documentation (read these first)
│   ├── ARCHITECTURE.md      # System design, data flow, tech decisions
│   ├── SETUP.md             # Step-by-step environment setup
│   ├── API.md                # Backend API reference
│   └── KNOWN_ISSUES.md       # Bugs hit in v1 + their fixes (baked into this code)
├── client/                  # React + Vite frontend
└── server/                  # Node + Express backend
```

## Tech Stack

| Layer | Technology | Cost |
|---|---|---|
| Frontend | React + Vite + Tailwind CSS | ₹0 |
| Backend | Node.js + Express | ₹0 |
| Database | MongoDB Atlas (free tier) | ₹0 |
| Speech-to-Text | Groq Whisper API | ₹0 (free tier) |
| Conversation AI | Groq LLM API (Llama 3) | ₹0 (free tier) |
| Text-to-Speech | Browser Web Speech API | ₹0 |

## Current Status

- [x] Project scaffolded, documented, and structured
- [x] Backend: DB connection + models (User, ConversationLog, Medicine, SosAlert, VoiceMessage)
- [x] Backend: Voice API (STT) — `POST /api/voice/transcribe`
- [x] Backend: Chat API (LLM) — `POST /api/chat`
- [x] Backend: Medicine schedule CRUD — `GET/POST/PUT/DELETE /api/medicine`
- [x] Backend: SOS alerts — `POST/GET /api/sos`, `PUT /api/sos/:id/resolve`
- [x] Backend: Voice messages — `POST/GET /api/messages`, `PUT /api/messages/:id/played`
- [x] Backend: Weekly cognitive trend reports — `GET /api/reports/:userId/weekly`
- [x] Frontend: Voice conversation state machine (`useConversation.js`)
- [x] Frontend: Elder dashboard (AI companion, medicines, SOS, messages from family)
- [x] Frontend: Family dashboard (medicine management, SOS alerts, voice messages, weekly reports)
- [x] Auth: JWT-based login/register with elder/family roles and elder linking

## Roadmap

- [ ] Push notification reminders for medicine times
- [ ] SMS/email/WhatsApp delivery for SOS alerts
- [ ] S3/GCS storage for voice messages (currently base64 in MongoDB)
- [ ] Multi-language support (currently English-only)
- [ ] Azure AI Speech TTS upgrade for Indian languages

## Development Workflow

This project is being built with **Claude Code** for the actual implementation work (writing/debugging/refactoring), following the plan and docs in this repo. Every non-trivial decision gets written down in `docs/` before or as it's coded — that's the "build like a professional team" rule for this project.
