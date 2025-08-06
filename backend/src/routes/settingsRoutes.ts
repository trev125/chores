import express from "express";
import { Database } from "../utils/database";

const router = express.Router();
const db = Database.getInstance();

// Get all settings
router.get("/", async (req, res) => {
  try {
    const settings = await db.all("SELECT * FROM app_settings");
    const settingsObj = settings.reduce((acc: any, setting: any) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {});
    return res.json(settingsObj);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch settings" });
  }
});

// Get setting by key
router.get("/:key", async (req, res) => {
  try {
    const { key } = req.params;
    const setting = await db.get("SELECT * FROM app_settings WHERE key = ?", [
      key,
    ]);

    if (!setting) {
      return res.status(404).json({ error: "Setting not found" });
    }

    return res.json({ key: setting.key, value: setting.value });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch setting" });
  }
});

// Update/Create setting
router.put("/:key", async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    if (value === undefined) {
      return res.status(400).json({ error: "Value is required" });
    }

    // Check if setting exists
    const existingSetting = await db.get(
      "SELECT * FROM app_settings WHERE key = ?",
      [key]
    );

    if (existingSetting) {
      await db.run("UPDATE app_settings SET value = ? WHERE key = ?", [
        value,
        key,
      ]);
    } else {
      await db.run("INSERT INTO app_settings (key, value) VALUES (?, ?)", [
        key,
        value,
      ]);
    }

    return res.json({ key, value });
  } catch (error) {
    return res.status(500).json({ error: "Failed to update setting" });
  }
});

export default router;
