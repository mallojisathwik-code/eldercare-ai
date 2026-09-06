import axios from "axios";
import mongoose from "mongoose";
import ConversationLog from "../models/ConversationLog.js";
import Medicine from "../models/Medicine.js";

const GROQ_CHAT_URL = "https://api.groq.com/openai/v1/chat/completions";

const MODEL_CANDIDATES = [
  "openai/gpt-oss-20b",
  "openai/gpt-oss-120b",
  "llama-3.3-70b-versatile",
];

// Reasoning models (the gpt-oss family) spend part of their token budget
// on internal reasoning even with reasoning_format: "hidden" — that
// reasoning still consumes tokens from max_tokens before any visible
// text is produced. Long-form requests (stories) also need real room to
// actually tell a story, not just answer in one line.
function getMaxTokens(model, isLongForm) {
  const base = model.startsWith("openai/gpt-oss") ? 300 : 120;
  return isLongForm ? base + 350 : base;
}

const BASE_SYSTEM_PROMPT = `You are a warm, familiar voice on the phone — like a close friend who
calls to check in every day, not an assistant. Talk the way a caring
friend actually talks: relaxed, genuinely curious about their day, a
little playful sometimes, never stiff or formal.
Ask real follow-up questions about their day, health, family, or old
memories — the way a friend who's known them a while would.
Never mention that you are an AI monitoring them. Never give medical
advice or diagnoses. If health concerns come up, gently suggest they
mention it to family or their doctor.
For ordinary back-and-forth conversation, keep replies short and
natural — 1-2 sentences, like a real phone chat, not a speech.
Do not explain your reasoning, and do not repeat the same idea twice.`;

const STORY_ADDENDUM = `\n\nThe person just asked for a story, tale, or something longer. This is
different from ordinary chat — go ahead and actually tell a proper short
story this time: a warm, gentle 6-10 sentence story with a clear
beginning, a little moment of warmth or gentle humor in the middle, and
a cozy, satisfying ending. Keep the language simple and easy to follow
when heard aloud, not read. Don't cut it short — a real story needs
room to breathe. You can end with a soft follow-up question if it fits
naturally, but the story itself comes first.`;

function isLongFormRequest(message) {
  return /\b(story|stories|tale|tales|fable|novel|bedtime story|tell me a story|make up a story|poem)\b/i.test(
    message
  );
}

const FORBIDDEN_MEDICINE_PATTERN = /\b(medicine|medication|pill|tablet|capsule|dose|dosage|supplement|vitamin|prescription|drug|injection|insulin|metformin|aspirin|ibuprofen|paracetamol|acetaminophen|blood pressure|diabetes|cholesterol|pain reliever|painkiller|antibiotic)\b/i;

async function buildMedicineContext(userId) {
  if (!mongoose.isValidObjectId(userId)) return "";
  const list = await Medicine.find({ userId, active: true }).lean().exec();
  if (!list.length) {
    return `\n\n[MEDICINE LOCK]\nThis person has NO medicines on file.\nRULE: If the user asks about medicine, pills, medication, supplements, or anything health-related that implies they take something, you MUST say: "You don't have any medicines on file yet. You might want to check with your family about that."\nFORBIDDEN: You must NEVER mention any medicine name, supplement, dosage, or health condition. This is a hard rule.`;
  }
  const lines = list.map((m, i) => `${i + 1}. ${m.name} — ${m.dosage} at ${m.times.join(" and ")}`);
  const joined = lines.join("\n");
  return `\n\n[MEDICINE LOCK]\nThe ONLY medicines this person has on file are:\n${joined}\nRULE: You may ONLY mention medicines from this exact numbered list. Copy the name and dosage exactly as shown.\nFORBIDDEN: You must NEVER mention any medicine, supplement, dosage, or health condition that is NOT in this list. If the user asks about something not in the list, say: "That's not on your current list. You might want to check with your family about that."\nThis is a hard rule. Breaking it is not allowed.`;
}

function computeMetrics(transcript) {
  const sentences = transcript.split(/[.!?]+/).map((sentence) => sentence.trim()).filter(Boolean);
  const words = transcript.toLowerCase().match(/[a-z']+/g) || [];

  return {
    wordCount: words.length,
    uniqueWordCount: new Set(words).size,
    sentenceCount: sentences.length || 1,
    avgWordsPerSentence: sentences.length ? +(words.length / sentences.length).toFixed(1) : words.length,
  };
}

function looksLikeReasoningLeak(reply) {
  if (!reply || typeof reply !== "string") return false;
  const patterns = [
    /we need to respond/i,
    /we need to produce/i,
    /the user asks/i,
    /the user is a/i,
    /the instruction says/i,
    /the story should be short/i,
    /we are to keep replies/i,
    /we must obey/i,
    /we should comply/i,
    /as an ai/i,
    /assistant\s*reply/i,
    /never mention that you are an ai/i,
    /keep replies short/i,
    /we should not mention/i,
  ];
  return patterns.some((pattern) => pattern.test(reply));
}

function shortenReply(reply, isLongForm = false) {
  if (!reply || typeof reply !== "string") return reply;

  const cleaned = reply.replace(/\s+/g, " ").trim();
  if (!cleaned) return reply;

  const sentences = cleaned.split(/(?<=[.!?])\s+/).map((sentence) => sentence.trim()).filter(Boolean);

  // Normal chit-chat: keep it to a real phone-conversation length.
  // Story requests: let it actually be a story, not a one-liner.
  const sentenceCap = isLongForm ? 12 : 2;
  const charCap = isLongForm ? 1400 : 240;
  const wordCapOnOverflow = isLongForm ? 220 : 18;

  let result = sentences.slice(0, sentenceCap).join(" ");

  if (!result) result = cleaned;
  if (result.length > charCap) {
    const words = result.split(/\s+/).filter(Boolean);
    result = words.slice(0, wordCapOnOverflow).join(" ");
  }

  result = result.replace(/\s+\w{1,2}\s*$/i, "").trim();
  if (!result) return "I’d love to share that with you. What stands out to you most about it?";
  if (!/[.!?]$/.test(result)) result += ".";

  if (looksLikeReasoningLeak(result)) {
    return "I’d love to share that with you. What stands out to you most about it?";
  }

  return result.trim();
}

function stripReasoningLeak(reply) {
  if (!reply || typeof reply !== "string") return reply;

  // xAI Grok models wrap thinking in <thinking>...</thinking>
  let cleaned = reply.replace(/<thinking\b[^>]*>[\s\S]*?<\/thinking>/gi, "").trim();

  // Qwen3-style visible reasoning: lines like "1. ...", "2. ...", analysis steps
  cleaned = cleaned
    .replace(/^[0-9]+\.\s+[^\n]+$\n?/gim, "")
    .replace(/(?:^|\n)\s*[-\*•]\s+(we need |we should |we must |the user |as an ai |our response |the reply )\S.*?(?=\n|$)/gi, "")
    .trim();

  if (cleaned !== reply) {
    console.warn("[chat] Stripped reasoning/thinking blocks from model reply");
  }

  return cleaned;
}

async function sanitizeMedicineReply(reply, userId) {
  reply = stripReasoningLeak(reply);
  if (!FORBIDDEN_MEDICINE_PATTERN.test(reply)) return reply;
  if (!mongoose.isValidObjectId(userId)) return reply;

  const allowed = await Medicine.find({ userId, active: true }).lean().exec();
  const allowedNames = allowed.map((m) => m.name.toLowerCase());

  const words = reply.split(/(\s+|[.,!?;:])/);
  const sanitized = words.map((token) => {
    if (/^\s+$|[.,!?;:]$/.test(token)) return token;
    const lower = token.toLowerCase().replace(/[^a-z'-]/g, "");
    if (!lower) return token;
    const isMedicineMention = FORBIDDEN_MEDICINE_PATTERN.test(lower);
    const isAllowed = allowedNames.some((name) => lower.includes(name) || name.includes(lower));
    if (isMedicineMention && !isAllowed) {
      return "[removed]";
    }
    return token;
  });

  let result = sanitized.join("");
  result = result.replace(/\s*\[removed\]\s*/g, " ").replace(/\s+/g, " ").trim();

  if (result !== reply) {
    const fallback = "I'm not sure about that. You might want to check with your family about your medicines.";
    result = result.length > 20 ? result : fallback;
  }

  return shortenReply(result);
}

export async function chat(req, res) {
  try {
    const { message, sessionId } = req.body;
    const userId = req.user?.id;
    if (!userId || !message) {
      return res.status(400).json({ error: "message is required and user must be authenticated." });
    }
    if (!sessionId) {
      return res.status(400).json({ error: "sessionId is required." });
    }

    const medicineContext = await buildMedicineContext(userId);
    const isLongForm = isLongFormRequest(message);
    const systemPrompt = BASE_SYSTEM_PROMPT + (isLongForm ? STORY_ADDENDUM : "") + medicineContext;

    let lastErr = null;
    let sawEmptyResponse = false;

    for (const model of MODEL_CANDIDATES) {
      try {
        const completion = await axios.post(
          GROQ_CHAT_URL,
          {
            model,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: message },
            ],
            max_tokens: getMaxTokens(model, isLongForm),
            temperature: 0.35,
            reasoning_format: "hidden",
          },
          {
            headers: {
              Authorization: "Bearer " + process.env.GROQ_API_KEY,
              "Content-Type": "application/json",
            },
            timeout: 60000,
          }
        );

        // Prefer the explicit assistant content. If it's empty, fall back to other available fields
        // (some Groq responses may put returned text in `message.reasoning` or `text` when `content` is empty).
        const choice = completion?.data?.choices?.[0] || {};
        const content = choice.message?.content?.trim();
        const altReasoning = choice.message?.reasoning?.trim();
        const altText = (choice.text || "").trim();
        let reply;

        if (content) {
          reply = content;
        } else if (altText) {
          console.warn(`[chat] Model ${model} returned empty message.content; using choice.text fallback.`);
          reply = altText;
        } else if (altReasoning) {
          console.warn(`[chat] Model ${model} returned empty message.content; using message.reasoning fallback.`);
          reply = altReasoning;
        } else {
          // Genuinely nothing usable came back — do NOT treat this as
          // success. Log diagnostics and move on to the next candidate
          // model instead of returning the apology message immediately.
          console.warn(
            `[chat] Model ${model} returned no usable text. finish_reason=${choice.finish_reason}, ` +
              `usage=${JSON.stringify(completion?.data?.usage)}`
          );
          sawEmptyResponse = true;
          continue;
        }

        reply = await sanitizeMedicineReply(reply, userId);
        reply = shortenReply(reply, isLongForm);

        const metrics = computeMetrics(message);
        let conversationLogId;
        if (mongoose.isValidObjectId(userId)) {
          try {
            const log = await ConversationLog.create({ userId, sessionId, transcript: message, reply, metrics });
            conversationLogId = log._id;
          } catch (error) {
            console.error("[chat] Conversation log save failed", error.message);
          }
        } else {
          console.warn("[chat] Skipping conversation log for non-ObjectId userId:", userId);
        }

        return res.json({ reply, sessionId, conversationLogId });
      } catch (err) {
        const status = err.response?.status;
        const message = err.response?.data?.error?.message || err.response?.data?.message || "";
        const isModelError = (status === 400 && /model/i.test(message)) || status === 404;
        const isAuthError = status === 401;

        if (isAuthError) {
          console.error("[chat] Groq auth error - invalid API key", err.response?.data || err.message);
          return res.status(502).json({ error: "AI service authentication failed. Check GROQ_API_KEY." });
        }

        if (!isModelError) {
          const groqError = err.response?.data || err.message;
          console.error("[chat] Groq error", groqError);
          console.error("[chat] Stack trace", err.stack);
          return res.status(err.response?.status || 500).json({
            error: typeof groqError === "string" ? groqError : JSON.stringify(groqError),
          });
        }

        lastErr = err;
        console.warn(`[chat] Model ${model} not available, trying next candidate...`);
      }
    }

    console.error(
      "[chat] All Groq model candidates failed or returned empty text.",
      lastErr?.response?.data || lastErr?.message || (sawEmptyResponse ? "All candidates returned empty content." : "")
    );
    return res.status(502).json({ error: "AI service unavailable. Please try again later." });
  } catch (err) {
    const groqError = err.response?.data || err.message;
    console.error("[chat] Groq error", groqError);
    console.error("[chat] Stack trace", err.stack);
    return res.status(err.response?.status || 500).json({
      error: typeof groqError === "string" ? groqError : JSON.stringify(groqError),
    });
  }
}

