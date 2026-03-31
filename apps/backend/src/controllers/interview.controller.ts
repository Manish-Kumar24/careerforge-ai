// D:\Project\ai-interview-tracker\apps\backend\src\controllers\interview.controller.ts

import Interview from "../models/Interview";

// GET
export const getInterviews = async (req: any, res: any) => {
  try {
    const data = await Interview.find({ userId: req.user.id });
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch interviews" });
  }
};

// CREATE
export const createInterview = async (req: any, res: any) => {
  try {
    const data = await Interview.create({
      ...req.body,
      userId: req.user.id,
    });

    return res.status(201).json(data);
  } catch (err) {
    return res.status(500).json({ error: "Failed to create interview" });
  }
};

// UPDATE
export const updateInterview = async (req: any, res: any) => {
  try {
    const { id } = req.params;

    const updated = await Interview.findOneAndUpdate(
      {
        _id: id,
        userId: req.user.id,
      },
      { $set: req.body },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Interview not found" });
    }

    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ error: "Failed to update interview" });
  }
};

// DELETE
export const deleteInterview = async (req: any, res: any) => {
  try {
    const { id } = req.params;

    const deleted = await Interview.findOneAndDelete({
      _id: id,
      userId: req.user.id,
    });

    if (!deleted) {
      return res.status(404).json({ error: "Interview not found" });
    }

    return res.json({ message: "Deleted successfully" });
  } catch (err) {
    return res.status(500).json({ error: "Failed to delete interview" });
  }
};