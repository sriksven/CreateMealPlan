import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { getProfile, updateProfile, resetUserData, analyzeBiometrics } from "../controllers/user.controller";

const router = Router();

// Get user profile
router.get("/profile", authMiddleware, getProfile);

// Update user profile (protein target, tags, etc.)
router.patch("/profile", authMiddleware, updateProfile);

// Analyze biometrics
router.post("/analyze", authMiddleware, analyzeBiometrics);

// Reset user data (pantry items, history)
router.delete("/data", authMiddleware, resetUserData);

export default router;
