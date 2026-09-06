import mongoose from "mongoose";

/**
 * One document per SOS trigger. Deliberately minimal for v1 — no
 * SMS/email/WhatsApp delivery yet (documented future scope), just a
 * record family can see on their dashboard. See docs/API.md → SOS.
 */
const sosAlertSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // the elder who triggered it
    triggeredAt: { type: Date, default: Date.now },
    resolved: { type: Boolean, default: false },
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("SosAlert", sosAlertSchema);
