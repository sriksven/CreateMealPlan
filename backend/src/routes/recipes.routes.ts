import express from "express";
import { generateRecipes } from "../controllers/recipes.controller";
import { verifyToken } from "../middleware/auth";

const router = express.Router();

router.post("/generate", verifyToken, generateRecipes);

export default router;
