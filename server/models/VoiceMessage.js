import mongoose from "mongoose";

/**
 * One document per voice message between family and elder.
 *
 * For v1 we store the audio as base64 directly in the document rather than
 * requiring S3/GCS. This is a deliberate tradeoff:
 *   Pros: zero extra infra, works on the free tier, simple CRUD.
 *   Cons: MongoDB document size limit is 16 MB, larger payloads over the
 *         wire, and repeated plays download the same bytes each time.
 *
 * When storage costs or message length become a problem, swap this to an
 * `audioUrl` field and upload to S3/GCS (or GridFS) — the API contract
 * stays the same.
 */
const voiceMessageSchema = new mongoose.Schema(
  {
    fromUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    toUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    audio: {
      data: { type: Buffer, required: true },
      contentType: { type: String, required: true, default: "audio/webm" },
    },
    transcript: { type: String, default: "" },
    playedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("VoiceMessage", voiceMessageSchema);
