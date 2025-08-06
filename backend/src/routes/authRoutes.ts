import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { Database } from "../utils/database";

const router = express.Router();
const db = Database.getInstance();

// Login with PIN
router.post("/login", async (req, res) => {
  try {
    const { pin } = req.body;

    if (!pin) {
      return res.status(400).json({ error: "PIN is required" });
    }

    // First check if this is the master PIN
    const masterPinRow = await db.get(
      "SELECT value FROM app_settings WHERE key = 'master_pin'"
    );

    if (masterPinRow) {
      const isValidMasterPin = await bcrypt.compare(pin, masterPinRow.value);
      if (isValidMasterPin) {
        // Create a virtual admin user for master PIN login
        const token = jwt.sign(
          {
            id: 0,
            name: "Admin",
            is_admin: true,
            isMasterUser: true,
          },
          process.env.JWT_SECRET || "default-secret",
          { expiresIn: "24h" }
        );

        return res.json({
          success: true,
          token,
          user: {
            id: 0,
            name: "Admin",
            is_admin: true,
          },
        });
      }
    }

    // If not master PIN, check for individual person PIN
    const person = await db.get("SELECT * FROM persons WHERE pin = ?", [pin]);

    if (!person) {
      return res.status(401).json({ error: "Invalid PIN" });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: person.id,
        name: person.name,
        is_admin: person.is_admin,
      },
      process.env.JWT_SECRET || "default-secret",
      { expiresIn: "24h" }
    );

    return res.json({
      success: true,
      token,
      user: {
        id: person.id,
        name: person.name,
        is_admin: person.is_admin,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: "Login failed" });
  }
});

// Verify token middleware
export const verifyToken = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "default-secret"
    );
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

export default router;
