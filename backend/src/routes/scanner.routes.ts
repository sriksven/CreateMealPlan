import { Router } from "express";
import multer from "multer";
import { scanReceipt, saveScannedItems } from "../controllers/scanner.controller";
import { authMiddleware } from "../middleware/auth";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Scan receipt image
router.post("/scan", authMiddleware, upload.single("image"), scanReceipt);

// Save scanned items to pantry
router.post("/save-items", authMiddleware, saveScannedItems);

export default router;
