import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { getProfile, updateProfile, resetUserData } from "../controllers/user.controller";

const router = Router();

// Get user profile
router.get("/profile", authMiddleware, getProfile);

// Update user profile (protein target, tags, etc.)
router.patch("/profile", authMiddleware, updateProfile);

// Reset user data (pantry items, history)
router.delete("/data", authMiddleware, resetUserData);

export default router;
