import { Request, Response } from "express";
import { db } from "../config/firebase";

// Get pantry history for user
export const getPantryHistory = async (req: Request, res: Response) => {
    try {
        const uid = (req as any).user?.uid;
        if (!uid) return res.status(401).json({ error: "Unauthorized" });

        const snapshot = await db
            .collection("pantry_history")
            .where("uid", "==", uid)
            // .orderBy("timestamp", "desc") // Removed to avoid composite index requirement
            .limit(100)
            .get();

        const history = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            // Convert Firestore timestamp to ISO string
            timestamp: doc.data().timestamp?.toDate?.()?.toISOString() || doc.data().timestamp,
        }));

        // Sort in memory (newest first)
        history.sort((a: any, b: any) => {
            const dateA = new Date(a.timestamp).getTime();
            const dateB = new Date(b.timestamp).getTime();
            return dateB - dateA;
        });

        res.json({ history });
    } catch (error) {
        console.error("Get history error:", error);
        res.status(500).json({ error: "Failed to fetch history" });
    }
};

// Get activity calendar (days with additions)
export const getActivityCalendar = async (req: Request, res: Response) => {
    try {
        const uid = (req as any).user?.uid;
        if (!uid) return res.status(401).json({ error: "Unauthorized" });

        const { startDate, endDate } = req.query;

        // Fetch all history for user (without range filter to avoid index issues)
        const snapshot = await db.collection("pantry_history")
            .where("uid", "==", uid)
            .limit(500) // Reasonable limit for calendar view
            .get();

        // Group by date
        const calendar: Record<string, { manual: number; receipt: number }> = {};

        const start = startDate ? new Date(startDate as string) : new Date(0);
        const end = endDate ? new Date(endDate as string) : new Date(8640000000000000);

        snapshot.docs.forEach((doc) => {
            const data = doc.data();
            const timestamp = data.timestamp?.toDate?.() || new Date(data.timestamp);

            // Filter in memory
            if (timestamp >= start && timestamp <= end) {
                const dateStr = timestamp.toISOString().split("T")[0];

                if (!calendar[dateStr]) {
                    calendar[dateStr] = { manual: 0, receipt: 0 };
                }

                const source = (data.source === 'receipt') ? 'receipt' : 'manual';
                calendar[dateStr][source]++;
            }
        });

        res.json({ calendar });
    } catch (error) {
        console.error("Get calendar error:", error);
        res.status(500).json({ error: "Failed to fetch calendar" });
    }
};

// Get items added on a specific date
export const getHistoryByDate = async (req: Request, res: Response) => {
    try {
        const uid = (req as any).user?.uid;
        if (!uid) return res.status(401).json({ error: "Unauthorized" });

        const { date } = req.params;
        const startOfDay = new Date(date as string);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date as string);
        endOfDay.setHours(23, 59, 59, 999);

        const snapshot = await db
            .collection("pantry_history")
            .where("uid", "==", uid)
            .where("timestamp", ">=", startOfDay)
            .where("timestamp", "<=", endOfDay)
            .get();

        const history = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate?.()?.toISOString() || doc.data().timestamp,
        }));

        res.json({ history });
    } catch (error) {
        console.error("Get history by date error:", error);
        res.status(500).json({ error: "Failed to fetch history" });
    }
};
