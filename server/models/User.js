import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["elder", "family"], required: true },
    // For "family" users, links to the elders they follow.
    // For "elder" users, this is left empty.
    linkedElderIds: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], default: [] },
    phone: { type: String },
    preferredLanguage: { type: String, default: "en" },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
