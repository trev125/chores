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
    const { title, points_required, assigned_to_id, assigned_to, is_one_time } =
      req.body;

    if (!title?.trim()) {
      return res.status(400).json({ error: "Title is required" });
    }

    const result = await db.run(
      `
      INSERT INTO rewards (title, points_required, assigned_to_id, assigned_to, is_one_time, updated_at)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `,
      [
        title.trim(),
        points_required,
        assigned_to_id || null,
        assigned_to || null,
        is_one_time !== undefined ? (is_one_time ? 1 : 0) : 1, // Default to one-time
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

// Complete reward (redeem by user)
router.post("/:id/complete", async (req: any, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const reward = await db.get("SELECT * FROM rewards WHERE id = ?", [id]);
    if (!reward) {
      return res.status(404).json({ error: "Reward not found" });
    }

    if (reward.is_one_time && reward.completed) {
      return res
        .status(400)
        .json({
          error:
            "This reward can only be redeemed once and has already been redeemed",
        });
    }

    // Check if user has enough points
    const user = await db.get("SELECT * FROM persons WHERE id = ?", [userId]);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.points < reward.points_required) {
      return res.status(400).json({ error: "Insufficient points" });
    }

    // Check if reward is assigned to specific person
    if (reward.assigned_to_id && reward.assigned_to_id !== userId) {
      return res
        .status(403)
        .json({ error: "This reward is not available to you" });
    }

    if (reward.is_one_time) {
      // For one-time rewards, mark the original reward as completed
      await db.run(
        `
        UPDATE rewards SET 
          completed = 1, 
          date_completed = CURRENT_TIMESTAMP,
          redeemed_by_id = ?,
          redeemed_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `,
        [userId, id]
      );
    } else {
      // For recurring rewards, create a new redemption record
      await db.run(
        `
        INSERT INTO rewards (title, points_required, assigned_to_id, assigned_to, is_one_time, completed, date_completed, redeemed_by_id, redeemed_at, fulfilled, created_at, updated_at)
        VALUES (?, ?, ?, ?, 1, 1, CURRENT_TIMESTAMP, ?, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `,
        [
          `${reward.title} (Redeemed)`,
          reward.points_required,
          null, // No specific assignment for redemption records
          null,
          userId,
        ]
      );
    }

    // Deduct points from user
    await db.run(
      `
      UPDATE persons SET points = points - ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `,
      [reward.points_required, userId]
    );

    // Log activity
    await db.run(
      `
      INSERT INTO activity_log (type, description, user_name)
      VALUES ('reward_redeemed', ?, ?)
    `,
      [
        `Redeemed reward: ${reward.title} (-${reward.points_required} points)`,
        user.name,
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

// Mark reward as fulfilled (admin only)
router.post("/:id/fulfill", async (req: any, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if user is admin
    const user = await db.get("SELECT * FROM persons WHERE id = ?", [userId]);
    if (!user?.is_admin && !req.user.isMasterUser) {
      return res.status(403).json({ error: "Admin access required" });
    }

    const reward = await db.get("SELECT * FROM rewards WHERE id = ?", [id]);
    if (!reward) {
      return res.status(404).json({ error: "Reward not found" });
    }

    if (!reward.completed) {
      return res
        .status(400)
        .json({ error: "Reward has not been redeemed yet" });
    }

    if (reward.fulfilled) {
      return res.status(400).json({ error: "Reward already fulfilled" });
    }

    // Mark as fulfilled
    await db.run(
      `
      UPDATE rewards SET 
        fulfilled = 1, 
        fulfilled_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `,
      [id]
    );

    // Log activity
    await db.run(
      `
      INSERT INTO activity_log (type, description, user_name)
      VALUES ('reward_fulfilled', ?, ?)
    `,
      [`Fulfilled reward: ${reward.title}`, req.user.name]
    );

    const updatedReward = await db.get(
      `
      SELECT r.*, p.name as person_name, redeemer.name as redeemed_by_name
      FROM rewards r 
      LEFT JOIN persons p ON r.assigned_to_id = p.id 
      LEFT JOIN persons redeemer ON r.redeemed_by_id = redeemer.id
      WHERE r.id = ?
    `,
      [id]
    );

    return res.json(updatedReward);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fulfill reward" });
  }
});

// Get pending redemptions (admin only)
router.get("/pending-redemptions", async (req: any, res) => {
  try {
    const userId = req.user.id;

    // Check if user is admin
    const user = await db.get("SELECT * FROM persons WHERE id = ?", [userId]);
    if (!user?.is_admin && !req.user.isMasterUser) {
      return res.status(403).json({ error: "Admin access required" });
    }

    const pendingRedemptions = await db.all(`
      SELECT r.*, p.name as person_name, redeemer.name as redeemed_by_name
      FROM rewards r 
      LEFT JOIN persons p ON r.assigned_to_id = p.id 
      LEFT JOIN persons redeemer ON r.redeemed_by_id = redeemer.id
      WHERE r.completed = 1 AND r.fulfilled = 0
      ORDER BY r.redeemed_at DESC
    `);

    return res.json(pendingRedemptions);
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Failed to fetch pending redemptions" });
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
