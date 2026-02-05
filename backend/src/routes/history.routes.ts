import express from "express";
import { getPantryHistory, getActivityCalendar, getHistoryByDate } from "../controllers/history.controller";
import { verifyToken } from "../middleware/auth";

const router = express.Router();

router.get("/pantry", verifyToken, getPantryHistory);
router.get("/calendar", verifyToken, getActivityCalendar);
router.get("/date/:date", verifyToken, getHistoryByDate);

export default router;
