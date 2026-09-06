# Architecture

## System Overview

```
                              FAMILY (Web Dashboard)
                                      │
                    Medicine Schedule │ Reports │ Voice Msgs │ SOS Alerts
                                      │
                                      ▼
                            ┌───────────────────┐
                            │  Express.js API    │
                            └─────────┬─────────┘
                     ┌────────────────┼────────────────┐
                     ▼                ▼                ▼
              /api/voice        /api/chat        /api/medicine
              (Groq Whisper)    (Groq LLM)        (MongoDB CRUD)
                     │                │                │
                     └────────────────┴────────────────┘
                                      ▼
                              MongoDB Atlas
                                      ▲
                                      │
                            ┌───────────────────┐
                            │  React Frontend    │
                            └───────────────────┘
                                      │
                          AICompanionCard (elder-facing)
                                      │
                    Record → STT → LLM Reply → TTS → Speak
```

## Data Flow: A Single Conversation Turn

1. Elder presses "Start" → `useAudioRecorder` begins recording via `MediaRecorder`.
2. Elder stops (or silence detected) → audio blob sent to `POST /api/voice/transcribe`.
3. Backend forwards audio to **Groq Whisper** → returns transcript text.
4. Transcript is validated (see Known Issue: silent-recording false transcripts) and, if valid, sent to `POST /api/chat`.
5. Backend sends transcript + recent conversation history to **Groq LLM** → returns a reply.
6. Reply text + metadata (duration, timestamp) is saved to MongoDB (`ConversationLog`).
7. Frontend receives reply → `speakText.js` uses the Browser Speech Synthesis API to speak it aloud.
8. State machine returns to `idle`, ready for the next turn.

## Conversation State Machine

This is the core reliability mechanism for the voice loop — carried over from v1 because it directly fixed the feedback-loop bug (see `KNOWN_ISSUES.md`).

```
   ┌──────┐   start recording   ┌───────────┐   stop / silence   ┌──────────────┐
   │ idle │ ───────────────────▶│ recording │────────────────────▶│ transcribing │
   └──────┘                     └───────────┘                     └──────────────┘
       ▲                                                                  │
       │                                                                  ▼
   ┌─────────┐   TTS finishes / aborted                            ┌──────────┐
   │ speaking │◀──────────────────────────────────────────────────│ thinking  │
   └─────────┘                                                     └──────────┘
```

Rules enforced by the state machine (`useConversation.js`):
- Recording can only start from `idle`. This alone prevents the AI's own voice from being re-captured.
- Every turn gets a fresh `sessionId`. Any async response (transcript, LLM reply) whose `sessionId` doesn't match the *current* session is discarded — this handles the case where a user interrupts mid-turn.
- An `AbortController` is created per turn and aborted on interrupt, cancelling in-flight fetches and any in-progress speech synthesis immediately.

## Cognitive Monitoring Approach

The system does **not** diagnose. It tracks communication-pattern metrics per session and stores them for trend analysis:
- Conversation duration
- Vocabulary richness (unique words / total words)
- Sentence complexity (avg. words per sentence, clause count via basic parsing)
- Repetition of stories/topics across sessions
- Long pauses (silence gaps during recording)
- Speaking frequency (sessions per week)

These are computed server-side after each conversation and stored in `ConversationLog`, then aggregated weekly for the family dashboard. No third-party ML model is required for v1 — basic NLP heuristics are sufficient and keep cost at ₹0.

## Why These Tech Choices

- **Groq** (not OpenAI/Azure) for both STT and LLM: generous free tier, low latency, single API key to manage.
- **Browser Speech Synthesis** (not Azure TTS) for v1: zero cost, zero setup, acceptable English quality. Flagged as a known limitation for Indian languages — Azure AI Speech is the documented upgrade path, not a rebuild.
- **MongoDB Atlas free tier**: no local DB setup, works immediately from any dev machine.
- **No camera/emotion-detection/TensorFlow/OpenCV**: removed from the original idea for cost, privacy, and complexity reasons — voice-only is easier to demo and appropriate for elderly users who may find cameras intrusive.

## Voice Message Storage (v1 Tradeoff)

For the voice-message feature, audio is stored as base64 inside the MongoDB document rather than as a URL to S3/GCS.

Why: no extra infrastructure, works immediately on the free tier, simple CRUD.

Tradeoffs:
- MongoDB documents have a 16 MB hard limit - fine for short voice notes, risky if recordings grow longer.
- Every play downloads the full base64 blob from the API - higher bandwidth and latency than a CDN URL.
- Upgrading later means migrating documents to object storage and swapping the audio field for an audioUrl, but the API contract (/api/messages) can stay the same.

See docs/API.md -> Messages for the endpoint details.
