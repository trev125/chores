import express from "express";
import { Database } from "../utils/database";
import { CreatePersonRequest, UpdatePersonRequest } from "../models/Person";

const router = express.Router();
const db = Database.getInstance();

// Get all persons
router.get("/", async (req, res) => {
  try {
    const persons = await db.all(`
      SELECT * FROM persons ORDER BY order_index ASC, created_at ASC
    `);
    return res.json(persons);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch persons" });
  }
});

// Get person by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const person = await db.get("SELECT * FROM persons WHERE id = ?", [id]);

    if (!person) {
      return res.status(404).json({ error: "Person not found" });
    }

    return res.json(person);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch person" });
  }
});

// Create new person
router.post("/", async (req, res) => {
  try {
    const personData: CreatePersonRequest = req.body;

    if (!personData.name?.trim()) {
      return res.status(400).json({ error: "Name is required" });
    }

    const result = await db.run(
      `
      INSERT INTO persons (name, avatar, color, pin, is_admin, updated_at)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `,
      [
        personData.name.trim(),
        personData.avatar || "default_avatar.png",
        personData.color || "#ffffff",
        personData.pin || null,
        personData.is_admin ? 1 : 0,
      ]
    );

    const newPerson = await db.get("SELECT * FROM persons WHERE id = ?", [
      result.lastID,
    ]);
    return res.status(201).json(newPerson);
  } catch (error) {
    return res.status(500).json({ error: "Failed to create person" });
  }
});

// Update person
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData: UpdatePersonRequest = req.body;

    // Build dynamic update query
    const updateFields: string[] = [];
    const updateValues: any[] = [];

    if (updateData.name !== undefined) {
      updateFields.push("name = ?");
      updateValues.push(updateData.name.trim());
    }
    if (updateData.avatar !== undefined) {
      updateFields.push("avatar = ?");
      updateValues.push(updateData.avatar);
    }
    if (updateData.color !== undefined) {
      updateFields.push("color = ?");
      updateValues.push(updateData.color);
    }
    if (updateData.pin !== undefined) {
      updateFields.push("pin = ?");
      updateValues.push(updateData.pin);
    }
    if (updateData.is_admin !== undefined) {
      updateFields.push("is_admin = ?");
      updateValues.push(updateData.is_admin ? 1 : 0);
    }
    if (updateData.points !== undefined) {
      updateFields.push("points = ?");
      updateValues.push(updateData.points);
    }
    if (updateData.order_index !== undefined) {
      updateFields.push("order_index = ?");
      updateValues.push(updateData.order_index);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    updateFields.push("updated_at = CURRENT_TIMESTAMP");
    updateValues.push(id);

    await db.run(
      `
      UPDATE persons SET ${updateFields.join(", ")} WHERE id = ?
    `,
      updateValues
    );

    const updatedPerson = await db.get("SELECT * FROM persons WHERE id = ?", [
      id,
    ]);
    return res.json(updatedPerson);
  } catch (error) {
    return res.status(500).json({ error: "Failed to update person" });
  }
});

// Reset points for a person
router.post("/:id/reset-points", async (req, res) => {
  try {
    const { id } = req.params;
    const { points = 0 } = req.body;

    if (points < 0) {
      return res.status(400).json({ error: "Points cannot be negative" });
    }

    await db.run(
      `
      UPDATE persons SET points = ?, bonus_points = 0, last_reset = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `,
      [points, id]
    );

    const updatedPerson = await db.get("SELECT * FROM persons WHERE id = ?", [
      id,
    ]);

    // Log activity
    await db.run(
      `
      INSERT INTO activity_log (type, description, user_name)
      VALUES ('points_reset', ?, ?)
    `,
      [
        `Points reset to ${points} for ${updatedPerson.name}`,
        updatedPerson.name,
      ]
    );

    return res.json(updatedPerson);
  } catch (error) {
    return res.status(500).json({ error: "Failed to reset points" });
  }
});

// Award bonus points
router.post("/:id/bonus-points", async (req, res) => {
  try {
    const { id } = req.params;
    const { points } = req.body;

    if (!points || points <= 0) {
      return res.status(400).json({ error: "Bonus points must be positive" });
    }

    await db.run(
      `
      UPDATE persons SET bonus_points = bonus_points + ?, points = points + ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `,
      [points, points, id]
    );

    const updatedPerson = await db.get("SELECT * FROM persons WHERE id = ?", [
      id,
    ]);

    // Log activity
    await db.run(
      `
      INSERT INTO activity_log (type, description, user_name)
      VALUES ('bonus_awarded', ?, ?)
    `,
      [
        `${points} bonus points awarded to ${updatedPerson.name}`,
        updatedPerson.name,
      ]
    );

    return res.json(updatedPerson);
  } catch (error) {
    return res.status(500).json({ error: "Failed to award bonus points" });
  }
});

// Delete person
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const person = await db.get("SELECT * FROM persons WHERE id = ?", [id]);
    if (!person) {
      return res.status(404).json({ error: "Person not found" });
    }

    // Delete associated chores and rewards
    await db.run("DELETE FROM chores WHERE assigned_to_id = ?", [id]);
    await db.run("DELETE FROM rewards WHERE assigned_to_id = ?", [id]);

    // Delete the person
    await db.run("DELETE FROM persons WHERE id = ?", [id]);

    return res.json({ success: true, message: "Person deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete person" });
  }
});

export default router;
