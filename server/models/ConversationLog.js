import mongoose from "mongoose";

/**
 * One document per conversation turn. Aggregated later (per week/month) to
 * produce the family-facing wellbeing trend reports. See
 * docs/ARCHITECTURE.md → Cognitive Monitoring Approach.
 */
const conversationLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    sessionId: { type: String, required: true },
    transcript: { type: String, required: true },
    reply: { type: String, required: true },
    metrics: {
      wordCount: { type: Number, default: 0 },
      uniqueWordCount: { type: Number, default: 0 },
      sentenceCount: { type: Number, default: 0 },
      avgWordsPerSentence: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

export default mongoose.model("ConversationLog", conversationLogSchema);
