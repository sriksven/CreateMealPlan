import { Router } from "express";
import {
  addItemsToPantry,
  getPantryItems,
  updatePantryItem,
  deletePantryItem,
  addSingleItem,
} from "../controllers/pantry.controller";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Get all pantry items
router.get("/", getPantryItems);

// Add multiple items to pantry (used by scanner)
router.post("/items", addItemsToPantry);

// Add a single item manually
router.post("/item", addSingleItem);

// Update a specific item
router.patch("/items/:itemId", updatePantryItem);

// Delete a specific item
router.delete("/items/:itemId", deletePantryItem);

export default router;
