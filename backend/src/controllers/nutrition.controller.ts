import { Request, Response } from "express";
import { db } from "../config/firebase";

// Log a meal or nutrition entry
export const logNutrition = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.uid;
        const { calories, protein, label } = req.body;

        if (calories === undefined || protein === undefined) {
            return res.status(400).json({ error: "Calories and protein are required" });
        }

        const dateStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

        // Log individual entry
        await db.collection("nutrition_logs").add({
            userId,
            date: dateStr,
            calories: Number(calories),
            protein: Number(protein),
            label: label || "Quick Add",
            timestamp: new Date()
        });

        res.status(200).json({ message: "Logged successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to log nutrition" });
    }
};

// Get today's totals
export const getDailyNutrition = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.uid;
        const dateStr = new Date().toISOString().split('T')[0];

        const snapshot = await db.collection("nutrition_logs")
            .where("userId", "==", userId)
            .where("date", "==", dateStr)
            .get();

        let totalCalories = 0;
        let totalProtein = 0;

        snapshot.docs.forEach(doc => {
            const data = doc.data();
            totalCalories += data.calories || 0;
            totalProtein += data.protein || 0;
        });

        res.json({ calories: totalCalories, protein: totalProtein });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch nutrition" });
    }
};

// Get history for charts (last 30 days)
export const getNutritionHistory = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.uid;
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

        const snapshot = await db.collection("nutrition_logs")
            .where("userId", "==", userId)
            .get();

        const history: Record<string, { calories: number; protein: number }> = {};

        snapshot.docs.forEach(doc => {
            const data = doc.data();
            const date = data.date;

            // Filter out dates older than 30 days
            if (date >= thirtyDaysAgoStr) {
                if (!history[date]) history[date] = { calories: 0, protein: 0 };
                history[date].calories += data.calories || 0;
                history[date].protein += data.protein || 0;
            }
        });

        res.json({ history });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch history" });
    }
};
