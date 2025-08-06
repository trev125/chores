import express from "express";
import { Database } from "../utils/database";

const router = express.Router();
const db = Database.getInstance();

// Get all activity logs
router.get("/", async (req, res) => {
  try {
    const { limit = 50, offset = 0, type } = req.query;

    let query = "SELECT * FROM activity_log";
    const params: any[] = [];

    if (type) {
      query += " WHERE type = ?";
      params.push(type);
    }

    query += " ORDER BY date DESC LIMIT ? OFFSET ?";
    params.push(Number(limit), Number(offset));

    const activities = await db.all(query, params);
    return res.json(activities);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch activity logs" });
  }
});

export default router;
