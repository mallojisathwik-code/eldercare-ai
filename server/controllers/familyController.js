import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET || "eldercare-secret-dev";

export async function getLinkedElder(req, res) {
  try {
    const family = await User.findById(req.user.id).select("linkedElderIds name email");
    if (!family || !family.linkedElderIds.length) {
      return res.json({ elder: null });
    }

    const elder = await User.findOne({ _id: { $in: family.linkedElderIds } }).select("name email _id");
    if (!elder) {
      return res.json({ elder: null });
    }

    return res.json({
      elder: {
        id: elder._id.toString(),
        name: elder.name,
        email: elder.email,
      },
    });
  } catch (err) {
    console.error("[family][getLinkedElder]", err);
    return res.status(500).json({ error: "Unable to fetch linked elder." });
  }
}

export async function getLinkedElders(req, res) {
  try {
    const family = await User.findById(req.user.id).select("linkedElderIds name email");
    if (!family || !family.linkedElderIds.length) {
      return res.json({ elders: [] });
    }

    const elders = await User.find({ _id: { $in: family.linkedElderIds } }).select("name email _id");
    const result = elders.map((e) => ({
      id: e._id.toString(),
      name: e.name,
      email: e.email,
    }));

    return res.json({ elders: result });
  } catch (err) {
    console.error("[family][getLinkedElders]", err);
    return res.status(500).json({ error: "Unable to fetch linked elders." });
  }
}

export async function addElder(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "name, email, and password are required." });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ error: "A user with that email already exists." });
    }

    const family = await User.findById(req.user.id);
    if (!family) {
      return res.status(400).json({ error: "Family account not found." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const elder = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      passwordHash,
      role: "elder",
    });

    family.linkedElderIds = [...(family.linkedElderIds || []), elder._id];
    await family.save();

    return res.status(201).json({
      elder: {
        id: elder._id.toString(),
        name: elder.name,
        email: elder.email,
      },
    });
  } catch (err) {
    console.error("[family][addElder]", err);
    return res.status(500).json({ error: "Unable to create elder account." });
  }
}

export async function resetElderPassword(req, res) {
  try {
    const { elderId } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }

    const family = await User.findById(req.user.id).select("linkedElderIds");
    if (!family || !family.linkedElderIds.includes(elderId)) {
      return res.status(403).json({ error: "Elder is not linked to this family account." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await User.findByIdAndUpdate(elderId, { passwordHash });

    return res.json({ message: "Password reset successfully." });
  } catch (err) {
    console.error("[family][resetElderPassword]", err);
    return res.status(500).json({ error: "Unable to reset password." });
  }
}
