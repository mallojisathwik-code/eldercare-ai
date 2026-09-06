import mongoose from "mongoose";

/**
 * One document per medicine for a given elder. `times` holds one or more
 * daily times (24h "HH:mm" strings) so a medicine taken twice a day is
 * still a single document. Managed by family, viewed by the elder.
 * See docs/API.md → Medicine.
 */
const medicineSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // the elder this belongs to
    name: { type: String, required: true },
    dosage: { type: String, required: true }, // e.g. "1 tablet", "5ml"
    times: {
      type: [String],
      required: true,
      validate: {
        validator: (arr) => arr.length > 0 && arr.every((t) => /^([01]\d|2[0-3]):[0-5]\d$/.test(t)),
        message: "times must be a non-empty array of HH:mm 24-hour strings",
      },
    },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Medicine", medicineSchema);
