import mongoose from "mongoose";
import Medicine from "../models/Medicine.js";
import User from "../models/User.js";

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

function validateTimes(times) {
  return Array.isArray(times) && times.length > 0 && times.every((t) => typeof t === "string" && TIME_REGEX.test(t.trim()));
}

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

export async function listMedicines(req, res) {
  try {
    const elderId = await resolveElderId(req);
    const medicines = await Medicine.find({ userId: elderId, active: true }).lean();

    medicines.sort((a, b) => (a.times[0] || "").localeCompare(b.times[0] || ""));

    res.json(medicines);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

export async function addMedicine(req, res) {
  try {
    const { name, dosage, times } = req.body;
    const elderId = await resolveElderId(req);

    if (!name || !dosage || !times) {
      return res.status(400).json({ error: "name, dosage, and times are required." });
    }
    if (!validateTimes(times)) {
      return res.status(400).json({ error: "times must be a non-empty array of HH:mm 24-hour strings." });
    }

    const medicine = await Medicine.create({
      userId: elderId,
      name: String(name).trim(),
      dosage: String(dosage).trim(),
      times: times.map((t) => t.trim()),
    });
    res.status(201).json(medicine);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

export async function updateMedicine(req, res) {
  try {
    const { id } = req.params;
    const { name, dosage, times } = req.body;
    const elderId = await resolveElderId(req);

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid medicine id." });
    }
    if (!name || !dosage || !times) {
      return res.status(400).json({ error: "name, dosage, and times are required." });
    }
    if (!validateTimes(times)) {
      return res.status(400).json({ error: "times must be a non-empty array of HH:mm 24-hour strings." });
    }

    const medicine = await Medicine.findOneAndUpdate(
      { _id: id, userId: elderId },
      { name: String(name).trim(), dosage: String(dosage).trim(), times: times.map((t) => t.trim()) },
      { new: true, runValidators: true }
    );

    if (!medicine) {
      return res.status(404).json({ error: "Medicine not found." });
    }
    res.json(medicine);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

export async function deleteMedicine(req, res) {
  try {
    const { id } = req.params;
    const elderId = await resolveElderId(req);

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid medicine id." });
    }

    const medicine = await Medicine.findOneAndDelete({ _id: id, userId: elderId });

    if (!medicine) {
      return res.status(404).json({ error: "Medicine not found." });
    }
    res.json({ message: "Medicine removed." });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}
