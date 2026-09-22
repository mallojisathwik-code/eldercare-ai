import "dotenv/config";
import dns from "node:dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import authRoutes from "./routes/authRoutes.js";
import voiceRoutes from "./routes/voiceRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import medicineRoutes from "./routes/medicineRoutes.js";
import sosRoutes from "./routes/sosRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import familyRoutes from "./routes/familyRoutes.js";
import User from "./models/User.js";
import Medicine from "./models/Medicine.js";
import ConversationLog from "./models/ConversationLog.js";
import { authMiddleware } from "./middleware/auth.js";

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [process.env.CLIENT_URL, "http://localhost:5173", "http://127.0.0.1:5173"].filter(Boolean);
app.use(cors({ origin: (origin, cb) => { if (!origin || allowedOrigins.includes(origin)) return cb(null, true); return cb(new Error("Not allowed by CORS")); } }));
app.use(express.json());

function validateEnv() {
  const missing = [];
  if (!process.env.MONGODB_URI) missing.push("MONGODB_URI");
  if (!process.env.GROQ_API_KEY) missing.push("GROQ_API_KEY");
  if (!process.env.JWT_SECRET) missing.push("JWT_SECRET");
  if (missing.length > 0) {
    console.error(`❌ Missing required environment variables: ${missing.join(", ")}. Copy server/.env.example to server/.env and fill them in.`);
    process.exit(1);
  }
  console.log(`🔑 GROQ_API_KEY loaded: ${process.env.GROQ_API_KEY.slice(0, 10)}...`);
}

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set.");
  }
  try {
    await mongoose.connect(uri);
    console.log("✅ MongoDB connected");
  } catch (err) {
    if (err.message?.includes("querySrv") || err.message?.includes("ECONNREFUSED")) {
      console.error("❌ MongoDB DNS resolution failed. Try switching your DNS to 8.8.8.8 or 1.1.1.1 and restart.");
    } else {
      console.error("❌ MongoDB connection failed:", err.message);
    }
    throw err;
  }
}

process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down gracefully...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n🛑 Shutting down gracefully...");
  process.exit(0);
});

// DEV-ONLY: admin debug endpoint. Remove or auth-gate this before any real
// deployment — it exposes every family account and their linked elders.
app.get("/api/admin/families", async (req, res) => {
  try {
    const families = await User.find({ role: "family" })
      .populate("linkedElderIds", "name email role")
      .lean();

    const result = await Promise.all(
      families.map(async (family) => {
        const elderIds = family.linkedElderIds || [];

        const [medicineCounts, logCounts] = await Promise.all([
          Medicine.aggregate([
            { $match: { userId: { $in: elderIds.map((id) => id._id) } } },
            { $group: { _id: "$userId", count: { $sum: 1 } } },
          ]),
          ConversationLog.aggregate([
            { $match: { userId: { $in: elderIds.map((id) => id._id) } } },
            { $group: { _id: "$userId", count: { $sum: 1 } } },
          ]),
        ]);

        const medMap = new Map(medicineCounts.map((c) => [c._id.toString(), c.count]));
        const logMap = new Map(logCounts.map((c) => [c._id.toString(), c.count]));

        const elders = elderIds.map((elder) => ({
          id: elder._id.toString(),
          name: elder.name,
          email: elder.email,
          role: elder.role,
          medicineCount: medMap.get(elder._id.toString()) || 0,
          conversationLogCount: logMap.get(elder._id.toString()) || 0,
        }));

        return {
          id: family._id.toString(),
          name: family.name,
          email: family.email,
          role: family.role,
          elders,
        };
      })
    );

    res.json(result);
  } catch (err) {
    console.error("[admin][families]", err);
    res.status(500).json({ error: "Unable to fetch admin data." });
  }
});

console.log("Mounting routes:");
const unprotectedRoutes = [
  { path: "/api/auth", router: authRoutes },
];
const protectedRoutes = [
  { path: "/api/voice", router: voiceRoutes },
  { path: "/api/chat", router: chatRoutes },
  { path: "/api/medicine", router: medicineRoutes },
  { path: "/api/sos", router: sosRoutes },
  { path: "/api/messages", router: messageRoutes },
  { path: "/api/reports", router: reportRoutes },
  { path: "/api/family", router: familyRoutes },
];

for (const { path, router } of unprotectedRoutes) {
  app.use(path, router);
  console.log(`  → mounted ${path}`);
}

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api", authMiddleware);

for (const { path, router } of protectedRoutes) {
  app.use(path, router);
  console.log(`  → mounted ${path}`);
}

app.use(notFoundHandler);
app.use(errorHandler);

async function start() {
  validateEnv();

  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(`❌ Port ${PORT} is already in use. Stop the existing process and try again.`);
    } else {
      console.error("❌ Server error:", err.message);
    }
  });

  try {
    await connectDB();
  } catch (err) {
    console.error("⚠️ Initial database connection attempt failed. Retrying in 5s...");
    setTimeout(connectDB, 5000);
  }
}

start();
