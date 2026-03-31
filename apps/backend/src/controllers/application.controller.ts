// filepath: apps/backend/src/controllers/application.controller.ts

import Application from "../models/Application";

// CREATE
export const createApplication = async (req: any, res: any) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const { company, role, status, notes, appliedDate } = req.body;

        // ✅ Validate required fields
        if (!company || !role) {
            return res.status(400).json({
                error: "Company and role are required"
            });
        }

        // ✅ CHECK FOR DUPLICATES (same user + company + role)
        const existing = await Application.findOne({
            userId,
            company: { $regex: new RegExp(`^${company.trim()}$`, 'i') }, // Case-insensitive
            role: { $regex: new RegExp(`^${role.trim()}$`, 'i') },       // Case-insensitive
        });

        if (existing) {
            return res.status(409).json({
                error: "Duplicate application",
                message: `You already have an application for ${company} - ${role}`,
                existingId: existing._id
            });
        }

        const app = await Application.create({
            userId,
            company: company.trim(),
            role: role.trim(),
            status: status || "applied",
            notes: notes || "",
            appliedDate: appliedDate || Date.now(),
            // ✅ Auto-log creation in timeline
            timeline: [{
                note: `Application created for ${company.trim()} - ${role.trim()}`,
                type: "created",
            }],
        });

        res.status(201).json(app);
    } catch (err: any) {
        console.error("❌ Create Application Error:", err.message || err);
        res.status(500).json({
            error: "Failed to create application",
            details: err.message || "Unknown error"
        });
    }
};

// GET ALL
export const getApplications = async (req: any, res: any) => {
    try {
        const userId = req.user.id;

        const apps = await Application.find({ userId }).sort({
            createdAt: -1,
        });

        res.json(apps);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch applications" });
    }
};

// UPDATE
export const updateApplication = async (req: any, res: any) => {
    try {
        const { id } = req.params;
        const { status, isPriority, ...otherUpdates } = req.body;

        const app = await Application.findOne({ _id: id, userId: req.user.id });

        if (!app) {
            return res.status(404).json({ error: "Application not found" });
        }

        const timelineUpdates: any[] = [];

        // ✅ Auto-log status changes
        if (status && status !== app.status) {
            timelineUpdates.push({
                note: `Status changed: ${app.status} → ${status}`,
                type: "status_change",
            });
        }

        // ✅ Auto-log priority toggles
        if (typeof isPriority === "boolean" && isPriority !== app.isPriority) {
            timelineUpdates.push({
                note: `Priority ${isPriority ? "added" : "removed"} ⭐`,
                type: "priority_toggle",
            });
        }
        const updated = await Application.findOneAndUpdate(
            { _id: id, userId: req.user.id },
            {
                $set: { ...otherUpdates, status, isPriority },
                $push: timelineUpdates.length > 0 ? { timeline: { $each: timelineUpdates } } : {}
            },
            { new: true }
        );

        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: "Failed to update" });
    }
};

// DELETE
export const deleteApplication = async (req: any, res: any) => {
    try {
        const { id } = req.params;

        await Application.findOneAndDelete({
            _id: id,
            userId: req.user.id,
        });

        res.json({ message: "Deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete" });
    }
};

// TOGGLE PRIORITY
export const togglePriority = async (req: any, res: any) => {
    try {
        const { id } = req.params;
        const { isPriority } = req.body;

        const app = await Application.findOneAndUpdate(
            { _id: id, userId: req.user.id },
        );

        if (!app) {
            return res.status(404).json({ error: "Application not found" });
        }
        const updated = await Application.findOneAndUpdate(
            { _id: id, userId: req.user.id },
            {
                $set: { isPriority },
                $push: {
                    timeline: {
                        note: `Priority ${isPriority ? "added" : "removed"} ⭐`,
                        type: "priority_toggle",
                    }
                }
            },
            { new: true }
        );

        res.json(app);
    } catch (err) {
        res.status(500).json({ error: "Failed to update priority" });
    }
};

// ✅ NEW: Add Manual Timeline Entry
export const addTimelineEntry = async (req: any, res: any) => {
    try {
        const { id } = req.params;
        const { note } = req.body;

        if (!note || note.trim() === "") {
            return res.status(400).json({ error: "Note is required" });
        }

        const app = await Application.findOneAndUpdate(
            { _id: id, userId: req.user.id },
            {
                $push: {
                    timeline: {
                        note: note.trim(),
                        type: "manual",
                    }
                }
            },
            { new: true }
        );

        if (!app) {
            return res.status(404).json({ error: "Application not found" });
        }

        res.json(app);
    } catch (err) {
        res.status(500).json({ error: "Failed to add timeline entry" });
    }
};