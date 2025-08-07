import express from "express";
import { Database } from "../utils/database";
import { CreateChoreRequest, UpdateChoreRequest } from "../models/Chore";

const router = express.Router();
const db = Database.getInstance();

// Get all chores
router.get("/", async (req, res) => {
  try {
    const chores = await db.all(`
      SELECT c.*, p.name as person_name 
      FROM chores c 
      LEFT JOIN persons p ON c.assigned_to_id = p.id 
      WHERE c.deleted = 0
      ORDER BY c.created_at DESC
    `);
    return res.json(chores);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch chores" });
  }
});

// Get chore by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const chore = await db.get(
      `
      SELECT c.*, p.name as person_name 
      FROM chores c 
      LEFT JOIN persons p ON c.assigned_to_id = p.id 
      WHERE c.id = ? AND c.deleted = 0
    `,
      [id]
    );

    if (!chore) {
      return res.status(404).json({ error: "Chore not found" });
    }

    return res.json(chore);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch chore" });
  }
});

// Create new chore
router.post("/", async (req, res) => {
  try {
    const choreData: CreateChoreRequest = req.body;

    if (!choreData.title?.trim()) {
      return res.status(400).json({ error: "Title is required" });
    }

    const result = await db.run(
      `
      INSERT INTO chores (title, assigned_to_id, assigned_to, points, is_daily, due_date, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `,
      [
        choreData.title.trim(),
        choreData.assigned_to_id || null,
        choreData.assigned_to || null,
        choreData.points || 1,
        choreData.is_daily ? 1 : 0,
        choreData.due_date || null,
      ]
    );

    const newChore = await db.get(
      `
      SELECT c.*, p.name as person_name 
      FROM chores c 
      LEFT JOIN persons p ON c.assigned_to_id = p.id 
      WHERE c.id = ?
    `,
      [result.lastID]
    );

    return res.status(201).json(newChore);
  } catch (error) {
    return res.status(500).json({ error: "Failed to create chore" });
  }
});

// Update chore
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData: UpdateChoreRequest = req.body;

    // Build dynamic update query
    const updateFields: string[] = [];
    const updateValues: any[] = [];

    if (updateData.title !== undefined) {
      updateFields.push("title = ?");
      updateValues.push(updateData.title.trim());
    }
    if (updateData.assigned_to_id !== undefined) {
      updateFields.push("assigned_to_id = ?");
      updateValues.push(updateData.assigned_to_id);
    }
    if (updateData.assigned_to !== undefined) {
      updateFields.push("assigned_to = ?");
      updateValues.push(updateData.assigned_to);
    }
    if (updateData.points !== undefined) {
      updateFields.push("points = ?");
      updateValues.push(updateData.points);
    }
    if (updateData.completed !== undefined) {
      updateFields.push("completed = ?");
      updateValues.push(updateData.completed ? 1 : 0);
      if (updateData.completed) {
        updateFields.push("date_completed = ?");
        updateValues.push(new Date().toISOString());
      }
    }
    if (updateData.is_daily !== undefined) {
      updateFields.push("is_daily = ?");
      updateValues.push(updateData.is_daily ? 1 : 0);
    }
    if (updateData.due_date !== undefined) {
      updateFields.push("due_date = ?");
      updateValues.push(updateData.due_date);
    }
    if (updateData.deleted !== undefined) {
      updateFields.push("deleted = ?");
      updateValues.push(updateData.deleted ? 1 : 0);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    updateFields.push("updated_at = CURRENT_TIMESTAMP");
    updateValues.push(id);

    await db.run(
      `
      UPDATE chores SET ${updateFields.join(", ")} WHERE id = ?
    `,
      updateValues
    );

    const updatedChore = await db.get(
      `
      SELECT c.*, p.name as person_name 
      FROM chores c 
      LEFT JOIN persons p ON c.assigned_to_id = p.id 
      WHERE c.id = ?
    `,
      [id]
    );

    return res.json(updatedChore);
  } catch (error) {
    return res.status(500).json({ error: "Failed to update chore" });
  }
});

// Complete chore
router.post("/:id/complete", async (req: any, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Get the chore
    const chore = await db.get("SELECT * FROM chores WHERE id = ?", [id]);
    if (!chore) {
      return res.status(404).json({ error: "Chore not found" });
    }

    if (chore.completed) {
      return res.status(400).json({ error: "Chore already completed" });
    }

    // Check if user is admin or if the chore is assigned to them
    const user = await db.get("SELECT * FROM persons WHERE id = ?", [userId]);
    const isAdmin = user?.is_admin || req.user.isMasterUser;
    const isAssignedToUser = chore.assigned_to_id === userId;

    if (!isAdmin && !isAssignedToUser) {
      return res
        .status(403)
        .json({ error: "You can only complete chores assigned to you" });
    }

    // Mark as completed
    await db.run(
      `
      UPDATE chores SET completed = 1, date_completed = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `,
      [id]
    );

    // Award points to the assigned person
    if (chore.assigned_to_id) {
      await db.run(
        `
        UPDATE persons SET points = points + ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `,
        [chore.points, chore.assigned_to_id]
      );
    }

    // Log activity
    await db.run(
      `
      INSERT INTO activity_log (type, description, user_name)
      VALUES ('chore_completed', ?, ?)
    `,
      [`Completed chore: ${chore.title} (+${chore.points} points)`, user.name]
    );

    const updatedChore = await db.get(
      `
      SELECT c.*, p.name as person_name 
      FROM chores c 
      LEFT JOIN persons p ON c.assigned_to_id = p.id 
      WHERE c.id = ?
    `,
      [id]
    );

    return res.json(updatedChore);
  } catch (error) {
    return res.status(500).json({ error: "Failed to complete chore" });
  }
});

// Delete chore
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const chore = await db.get("SELECT * FROM chores WHERE id = ?", [id]);
    if (!chore) {
      return res.status(404).json({ error: "Chore not found" });
    }

    if (chore.is_daily) {
      // For daily chores, mark as deleted instead of actual deletion
      await db.run(
        "UPDATE chores SET deleted = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [id]
      );
    } else {
      // For regular chores, actually delete
      await db.run("DELETE FROM chores WHERE id = ?", [id]);
    }

    return res.json({ success: true, message: "Chore deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete chore" });
  }
});

export default router;
