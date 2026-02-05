import express from "express";
import cors from "cors";
import scannerRoutes from "./routes/scanner.routes";
import pantryRoutes from "./routes/pantry.routes";
import userRoutes from "./routes/user.routes";
import historyRoutes from "./routes/history.routes";

const app = express();

/**
 * ✅ SIMPLE, SAFE CORS
 * This alone is enough to handle preflight
 */
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      // Allow any localhost origin
      if (origin.startsWith('http://localhost:')) {
        return callback(null, true);
      }
      // Block others
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  })
);

app.use(express.json());

// Routes
app.use("/api/scanner", scannerRoutes);
app.use("/api/pantry", pantryRoutes);
app.use("/api/user", userRoutes);
app.use("/api/history", historyRoutes);

// Health check
app.get("/", (_req, res) => {
  res.send("Backend running 🚀");
});

export default app;
