import axios from "axios";
import FormData from "form-data";

const GROQ_TRANSCRIPTIONS_URL = "https://api.groq.com/openai/v1/audio/transcriptions";
const MIN_TRANSCRIPT_CHARS = 3;
const JUNK_TRANSCRIPTS = new Set(["thanks", "thank you", "yes", "hello", "bye", "ok", "okay"]);

export async function transcribeAudio(req, res) {
  console.log("[voice] Request received", {
    method: req.method,
    contentType: req.headers["content-type"],
  });
  console.log("[voice] req.file", req.file
    ? {
        fieldname: req.file.fieldname,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
      }
    : undefined);
  console.log("[voice] GROQ_API_KEY exists:", Boolean(process.env.GROQ_API_KEY));

  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "No audio uploaded" });
    }

    if (file.size && file.size < 1500) {
      return res.status(204).send();
    }

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ error: "GROQ_API_KEY is not configured" });
    }

    const form = new FormData();
    form.append("file", file.buffer, {
      filename: file.originalname || "voice.webm",
      contentType: file.mimetype || "audio/webm",
    });
    form.append("model", "whisper-large-v3");

    const response = await axios.post(GROQ_TRANSCRIPTIONS_URL, form, {
      headers: {
        ...form.getHeaders(),
        Authorization: "Bearer " + process.env.GROQ_API_KEY,
      },
      timeout: 60000,
    });

    console.log("[voice] Groq response", response.data);
    const transcript = (response.data.text || "").trim();
    const normalized = transcript.toLowerCase().replace(/[.,!?]/g, "").trim();

    if (transcript.length < MIN_TRANSCRIPT_CHARS || JUNK_TRANSCRIPTS.has(normalized)) {
      return res.status(204).send();
    }

    return res.json({ transcript });
  } catch (err) {
    const groqError = err.response?.data || err.message;
    console.error("[voice] Groq error", groqError);
    console.error("[voice] Stack trace", err.stack);

    return res.status(err.response?.status || 500).json({
      error: typeof groqError === "string" ? groqError : JSON.stringify(groqError),
    });
  }
}

