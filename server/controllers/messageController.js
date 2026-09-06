import mongoose from "mongoose";
import VoiceMessage from "../models/VoiceMessage.js";
import User from "../models/User.js";

async function resolveElderId(req) {
  if (req.user.role === "family") {
    const elderId = req.params.elderId;
    if (!elderId) {
      const err = new Error("elderId is required for family accounts.");
      err.status = 400;
      throw err;
    }
    if (!mongoose.isValidObjectId(elderId)) {
      const err = new Error("Invalid elderId.");
      err.status = 400;
      throw err;
    }
    const family = await User.findById(req.user.id).select("linkedElderIds");
    if (!family || !family.linkedElderIds.includes(new mongoose.Types.ObjectId(elderId))) {
      const err = new Error("You do not have access to this elder.");
      err.status = 403;
      throw err;
    }
    return elderId;
  }
  if (req.user.role !== "elder") {
    const err = new Error("Only elder or family role is allowed.");
    err.status = 403;
    throw err;
  }
  return req.user.id;
}

function base64ToBuffer(base64) {
  const matches = base64.match(/^data:(.+);base64,(.+)$/);
  let buffer;
  let contentType = "audio/webm";

  if (!matches) {
    buffer = Buffer.from(base64, "base64");
  } else {
    contentType = matches[1];
    buffer = Buffer.from(matches[2], "base64");
  }

  return { buffer: Buffer.from(buffer), contentType };
}

export async function sendMessage(req, res) {
  try {
    const { toUserId, audio, transcript, contentType } = req.body;
    const elderId = await resolveElderId(req);

    if (!toUserId || !audio) {
      return res.status(400).json({ error: "toUserId and audio are required." });
    }
    if (toUserId === req.user.id) {
      return res.status(400).json({ error: "You cannot send a message to yourself." });
    }

    const target = await User.findById(toUserId);
    if (!target) {
      return res.status(404).json({ error: "Recipient user not found." });
    }

    const { buffer, contentType: detectedType } = base64ToBuffer(audio);
    const finalContentType = contentType || detectedType || "audio/webm";

    if (buffer.length > 10 * 1024 * 1024) {
      return res.status(413).json({ error: "Audio is too large (max 10 MB)." });
    }

    const message = await VoiceMessage.create({
      fromUserId: req.user.id,
      toUserId,
      audio: {
        data: buffer,
        contentType: finalContentType,
      },
      transcript: transcript || "",
    });

    res.status(201).json({
      _id: message._id,
      fromUserId: message.fromUserId,
      toUserId: message.toUserId,
      audioContentType: message.audio.contentType,
      transcript: message.transcript,
      playedAt: message.playedAt,
      createdAt: message.createdAt,
    });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

export async function listMessages(req, res) {
  try {
    const elderId = await resolveElderId(req);

    let filter;
    if (req.user.role === "family") {
      filter = {
        $or: [
          { toUserId: elderId },
          { fromUserId: elderId, toUserId: req.user.id },
        ],
      };
    } else {
      filter = { toUserId: elderId };
    }

    const messages = await VoiceMessage.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    const result = messages.map((m) => ({
      _id: m._id,
      fromUserId: m.fromUserId,
      toUserId: m.toUserId,
      audioBase64: m.audio.data.toString("base64"),
      audioContentType: m.audio.contentType,
      transcript: m.transcript,
      playedAt: m.playedAt,
      createdAt: m.createdAt,
    }));

    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

export async function markPlayed(req, res) {
  try {
    const { id } = req.params;
    const elderId = await resolveElderId(req);

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid message id." });
    }

    const message = await VoiceMessage.findOneAndUpdate(
      { _id: id, toUserId: elderId, playedAt: null },
      { playedAt: new Date() },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ error: "Message not found or already played." });
    }

    res.json({
      _id: message._id,
      fromUserId: message.fromUserId,
      toUserId: message.toUserId,
      audioContentType: message.audio.contentType,
      transcript: message.transcript,
      playedAt: message.playedAt,
      createdAt: message.createdAt,
    });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}
