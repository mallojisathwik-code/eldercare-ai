import mongoose from "mongoose";

/**
 * Connects to MongoDB Atlas.
 *
 * If this throws `querySrv ECONNREFUSED`, it is almost always a DNS
 * resolution issue with the mongodb+srv:// scheme, NOT a credentials or
 * network-access problem. See docs/KNOWN_ISSUES.md #1 before debugging
 * further — switching the machine's DNS to 8.8.8.8 or 1.1.1.1 fixed this
 * in v1.
 */
export async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error(
      "MONGODB_URI is not set. Copy server/.env.example to server/.env and fill it in."
    );
  }

  try {
    await mongoose.connect(uri);
    console.log("✅ MongoDB connected");
  } catch (err) {
    if (err.message?.includes("querySrv") || err.message?.includes("ECONNREFUSED")) {
      console.error(
        "❌ MongoDB DNS resolution failed. This is a known issue — " +
          "see docs/KNOWN_ISSUES.md #1. Try switching your DNS to 8.8.8.8 " +
          "(Google) or 1.1.1.1 (Cloudflare) and restart."
      );
    } else {
      console.error("❌ MongoDB connection failed:", err.message);
    }
    throw err;
  }
}
