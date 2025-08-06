import express from "express";
import bcrypt from "bcrypt";
import { Database } from "../utils/database";

const router = express.Router();
const db = Database.getInstance();

// Check if setup is needed (no master PIN set)
router.get("/status", async (req, res) => {
  try {
    const masterPin = await db.get(
      "SELECT value FROM app_settings WHERE key = 'master_pin'"
    );

    const setupNeeded = !masterPin;

    return res.json({
      setupNeeded,
      masterPinSet: !setupNeeded,
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to check setup status" });
  }
});

// Complete setup wizard
router.post("/complete", async (req, res) => {
  try {
    const { masterPin, people } = req.body;

    if (!masterPin || !masterPin.trim()) {
      return res.status(400).json({ error: "Master PIN is required" });
    }

    if (!people || !Array.isArray(people) || people.length === 0) {
      return res.status(400).json({ error: "At least one person is required" });
    }

    // Check if setup is already complete
    const existingMasterPin = await db.get(
      "SELECT value FROM app_settings WHERE key = 'master_pin'"
    );

    if (existingMasterPin) {
      return res.status(400).json({ error: "Setup already completed" });
    }

    // Hash the master PIN
    const saltRounds = 12;
    const hashedPin = await bcrypt.hash(masterPin.trim(), saltRounds);

    // Start a transaction-like approach by collecting all operations
    try {
      // Insert master PIN
      await db.run("INSERT INTO app_settings (key, value) VALUES (?, ?)", [
        "master_pin",
        hashedPin,
      ]);

      // Insert people
      for (let i = 0; i < people.length; i++) {
        const person = people[i];
        if (person.name && person.name.trim()) {
          await db.run(
            `INSERT INTO persons (name, pin, is_admin, order_index, created_at, updated_at) 
             VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
            [person.name.trim(), person.pin || null, person.isAdmin ? 1 : 0, i]
          );
        }
      }

      // Log setup completion
      await db.run(
        `INSERT INTO activity_log (type, description, user_name) 
         VALUES (?, ?, ?)`,
        [
          "setup_complete",
          `Setup wizard completed with ${people.length} people`,
          "System",
        ]
      );

      return res.json({
        success: true,
        message: "Setup completed successfully",
      });
    } catch (dbError) {
      // If any database operation fails, we should ideally rollback
      // For now, return error - in production you'd want proper transaction handling
      console.error("Setup database error:", dbError);
      return res.status(500).json({
        error: "Failed to complete setup due to database error",
      });
    }
  } catch (error) {
    console.error("Setup error:", error);
    return res.status(500).json({ error: "Failed to complete setup" });
  }
});

// Verify master PIN (for admin functions)
router.post("/verify-master", async (req, res) => {
  try {
    const { pin } = req.body;

    if (!pin) {
      return res.status(400).json({ error: "PIN is required" });
    }

    const masterPinRow = await db.get(
      "SELECT value FROM app_settings WHERE key = 'master_pin'"
    );

    if (!masterPinRow) {
      return res.status(400).json({ error: "Master PIN not set" });
    }

    const isValid = await bcrypt.compare(pin, masterPinRow.value);

    if (isValid) {
      return res.json({ success: true, valid: true });
    } else {
      return res.json({ success: true, valid: false });
    }
  } catch (error) {
    console.error("Master PIN verification error:", error);
    return res.status(500).json({ error: "Failed to verify PIN" });
  }
});

export default router;
