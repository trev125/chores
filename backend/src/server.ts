import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import rateLimit from "express-rate-limit";
import path from "path";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Import routes
import choreRoutes from "./routes/choreRoutes";
import personRoutes from "./routes/personRoutes";
import rewardRoutes from "./routes/rewardRoutes";
import authRoutes, { verifyToken } from "./routes/authRoutes";
import activityRoutes from "./routes/activityRoutes";
import settingsRoutes from "./routes/settingsRoutes";
import setupRoutes from "./routes/setupRoutes";

// Import database initialization
import { initializeDatabase } from "./utils/database";

const app = express();
const PORT = process.env.PORT || 3001;

// Rate limiting - more permissive for local development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Much higher limit for local development
  message: "Too many requests from this IP, please try again later.",
  skip: (req) => {
    // Skip rate limiting for localhost in development
    const isLocalhost =
      req.hostname === "localhost" || req.hostname === "127.0.0.1";
    return process.env.NODE_ENV === "development" && isLocalhost;
  },
});

// Middleware
// CORS must be first to handle preflight requests
app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(helmet());
app.use(compression());
app.use(limiter);

app.use(morgan("combined"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (for uploads)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/setup", setupRoutes);
app.use("/api/chores", verifyToken, choreRoutes);
app.use("/api/persons", verifyToken, personRoutes);
app.use("/api/rewards", verifyToken, rewardRoutes);
app.use("/api/activities", verifyToken, activityRoutes);
app.use("/api/settings", verifyToken, settingsRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({
      error: "Something went wrong!",
      message:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Internal server error",
    });
  }
);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Initialize database and start server
async function startServer() {
  try {
    await initializeDatabase();
    console.log("Database initialized successfully");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 API available at http://localhost:${PORT}/api`);
      console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();

export default app;
