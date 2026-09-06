import mongoose from "mongoose";
import SosAlert from "../models/SosAlert.js";
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

export async function triggerSos(req, res) {
  try {
    const elderId = await resolveElderId(req);
    const alert = await SosAlert.create({ userId: elderId });
    res.status(201).json(alert);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

export async function listSos(req, res) {
  try {
    const elderId = await resolveElderId(req);
    const alerts = await SosAlert.find({ userId: elderId })
      .sort({ triggeredAt: -1 })
      .lean();
    res.json(alerts);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

export async function resolveSos(req, res) {
  try {
    const { id } = req.params;
    const elderId = await resolveElderId(req);

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid alert id." });
    }

    const alert = await SosAlert.findOneAndUpdate(
      { _id: id, userId: elderId, resolved: false },
      { resolved: true, resolvedAt: new Date() },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({ error: "Alert not found or already resolved." });
    }
    res.json(alert);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}
