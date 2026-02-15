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

        const history: Record<string, { calories: number; protein: number; recipes: string[] }> = {};

        snapshot.docs.forEach(doc => {
            const data = doc.data();
            const date = data.date;

            // Filter out dates older than 30 days
            if (date >= thirtyDaysAgoStr) {
                if (!history[date]) history[date] = { calories: 0, protein: 0, recipes: [] };
                history[date].calories += data.calories || 0;
                history[date].protein += data.protein || 0;
                if (data.label) {
                    history[date].recipes.push(data.label);
                }
            }
        });

        res.json({ history });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch history" });
    }
};

/**
 * Complete a recipe - updates nutrition history and deducts from pantry
 */
export const completeRecipe = async (req: any, res: Response) => {
    try {
        const userId = req.user.uid;
        const { recipe } = req.body;

        if (!recipe || !recipe.title) {
            return res.status(400).json({ error: "Recipe data is required" });
        }

        // Parse nutrition values from recipe
        const calories = parseNutritionValue(recipe.calories);
        const protein = parseNutritionValue(recipe.protein);

        // Get today's date
        const dateStr = new Date().toISOString().split('T')[0];

        // Log nutrition
        await db.collection("nutrition_logs").add({
            userId,
            date: dateStr,
            calories,
            protein,
            label: recipe.title,
            timestamp: new Date()
        });

        // Deduct ingredients from pantry
        const pantryUpdates: any[] = [];
        if (recipe.usedIngredients && Array.isArray(recipe.usedIngredients)) {
            for (const ingredient of recipe.usedIngredients) {
                const update = await deductIngredientFromPantry(userId, ingredient);
                if (update) {
                    pantryUpdates.push(update);
                }
            }
        }

        // Get updated totals
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

        res.status(200).json({
            success: true,
            nutritionTotals: {
                calories: totalCalories,
                protein: totalProtein
            },
            pantryUpdates
        });

    } catch (error: any) {
        console.error("Error completing recipe:", error);
        res.status(500).json({
            error: "Failed to complete recipe",
            details: error.message
        });
    }
};

/**
 * Helper: Parse nutrition value from string (e.g., "500 kcal" -> 500)
 */
function parseNutritionValue(value: string | number | undefined): number {
    if (typeof value === 'number') return value;
    if (!value) return 0;

    const match = value.toString().match(/(\d+\.?\d*)/);
    return match ? parseFloat(match[1]) : 0;
}

/**
 * Helper: Deduct ingredient from pantry
 */
async function deductIngredientFromPantry(userId: string, ingredientName: string) {
    try {
        // Find matching pantry item
        const pantrySnapshot = await db.collection("pantry")
            .where("userId", "==", userId)
            .get();

        let bestMatch: any = null;
        let bestScore = 0;

        // Simple fuzzy matching
        pantrySnapshot.docs.forEach(doc => {
            const item = doc.data();
            const score = calculateMatchScore(ingredientName.toLowerCase(), item.name.toLowerCase());
            if (score > bestScore) {
                bestScore = score;
                bestMatch = { id: doc.id, ...item };
            }
        });

        if (!bestMatch || bestScore < 0.5) {
            console.log(`No pantry match found for: ${ingredientName}`);
            return null;
        }

        // Deduct 10% of pantry quantity as placeholder
        const currentQty = parseFloat(bestMatch.quantity) || 0;
        const deductAmount = currentQty * 0.1;
        const newQty = Math.max(0, currentQty - deductAmount);

        if (newQty === 0) {
            // Delete item if depleted
            await db.collection("pantry").doc(bestMatch.id).delete();
            return {
                item: bestMatch.name,
                oldAmount: `${currentQty} ${bestMatch.unit}`,
                newAmount: "0 (deleted)",
                action: "deleted"
            };
        } else {
            // Update quantity
            await db.collection("pantry").doc(bestMatch.id).update({
                quantity: newQty.toString()
            });
            return {
                item: bestMatch.name,
                oldAmount: `${currentQty.toFixed(1)} ${bestMatch.unit}`,
                newAmount: `${newQty.toFixed(1)} ${bestMatch.unit}`,
                action: "updated"
            };
        }

    } catch (error) {
        console.error(`Error deducting ${ingredientName}:`, error);
        return null;
    }
}

/**
 * Helper: Calculate match score between two strings
 */
function calculateMatchScore(str1: string, str2: string): number {
    // Exact match
    if (str1 === str2) return 1.0;

    // Contains match
    if (str1.includes(str2) || str2.includes(str1)) return 0.8;

    // Word overlap
    const words1 = str1.split(' ');
    const words2 = str2.split(' ');
    const overlap = words1.filter(w => words2.includes(w)).length;
    const total = Math.max(words1.length, words2.length);

    return overlap / total;
}
