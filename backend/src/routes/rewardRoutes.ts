import express from "express";
import { Database } from "../utils/database";

const router = express.Router();
const db = Database.getInstance();

// Get all rewards
router.get("/", async (req, res) => {
  try {
    const rewards = await db.all(`
      SELECT r.*, p.name as person_name 
      FROM rewards r 
      LEFT JOIN persons p ON r.assigned_to_id = p.id 
      ORDER BY r.created_at DESC
    `);
    return res.json(rewards);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch rewards" });
  }
});

// Create new reward
router.post("/", async (req, res) => {
  try {
    const { title, points_required, assigned_to_id, assigned_to } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ error: "Title is required" });
    }

    const result = await db.run(
      `
      INSERT INTO rewards (title, points_required, assigned_to_id, assigned_to, updated_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    `,
      [
        title.trim(),
        points_required,
        assigned_to_id || null,
        assigned_to || null,
      ]
    );

    const newReward = await db.get(
      `
      SELECT r.*, p.name as person_name 
      FROM rewards r 
      LEFT JOIN persons p ON r.assigned_to_id = p.id 
      WHERE r.id = ?
    `,
      [result.lastID]
    );

    return res.status(201).json(newReward);
  } catch (error) {
    return res.status(500).json({ error: "Failed to create reward" });
  }
});

// Complete reward
router.post("/:id/complete", async (req, res) => {
  try {
    const { id } = req.params;

    const reward = await db.get("SELECT * FROM rewards WHERE id = ?", [id]);
    if (!reward) {
      return res.status(404).json({ error: "Reward not found" });
    }

    // Mark as completed and deduct points
    await db.run(
      `
      UPDATE rewards SET completed = 1, date_completed = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `,
      [id]
    );

    if (reward.assigned_to_id) {
      await db.run(
        `
        UPDATE persons SET points = points - ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `,
        [reward.points_required, reward.assigned_to_id]
      );
    }

    // Log activity
    await db.run(
      `
      INSERT INTO activity_log (type, description, user_name)
      VALUES ('reward_completed', ?, ?)
    `,
      [
        `Redeemed reward: ${reward.title} (-${reward.points_required} points)`,
        reward.assigned_to || "Unknown",
      ]
    );

    const updatedReward = await db.get(
      `
      SELECT r.*, p.name as person_name 
      FROM rewards r 
      LEFT JOIN persons p ON r.assigned_to_id = p.id 
      WHERE r.id = ?
    `,
      [id]
    );

    return res.json(updatedReward);
  } catch (error) {
    return res.status(500).json({ error: "Failed to complete reward" });
  }
});

// Delete reward
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.run("DELETE FROM rewards WHERE id = ?", [id]);
    return res.json({ success: true, message: "Reward deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete reward" });
  }
});

export default router;
