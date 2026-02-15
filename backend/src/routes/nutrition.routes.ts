import express from "express";
import { logNutrition, getDailyNutrition, getNutritionHistory, completeRecipe } from "../controllers/nutrition.controller";
import { verifyToken } from "../middleware/auth";

const router = express.Router();

router.post("/log", verifyToken, logNutrition);
router.post("/complete-recipe", verifyToken, completeRecipe);
router.get("/today", verifyToken, getDailyNutrition);
router.get("/history", verifyToken, getNutritionHistory);

export default router;
