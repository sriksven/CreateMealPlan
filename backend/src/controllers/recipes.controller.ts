import { Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "../config/firebase";

// Use separate API key for recipes as configured
const genAI = new GoogleGenerativeAI(process.env.GEMINI_RECIPE_API_KEY || "");

export const generateRecipes = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.uid;
        const { cuisine } = req.body;

        if (!cuisine) {
            return res.status(400).json({ error: "Cuisine is required" });
        }

        // 1. Fetch user's pantry items AND profile settings
        const [pantrySnapshot, userDoc] = await Promise.all([
            db.collection("pantry").where("userId", "==", userId).get(),
            db.collection("users").doc(userId).get()
        ]);

        const pantryItems = pantrySnapshot.docs.map(doc => doc.data().name);

        // Get Dietary Goals
        const userData = userDoc.data();
        const proteinTarget = userData?.proteinTarget || 150; // Default
        const dietTags = userData?.tags && Array.isArray(userData.tags) ? userData.tags.join(", ") : "";

        // Biometrics
        const biometrics = `
      Gender: ${userData?.gender || 'N/A'}
      Weight: ${userData?.weight ? userData.weight + 'kg' : 'N/A'}
      Height: ${userData?.height ? userData.height + 'cm' : 'N/A'}
    `;

        if (pantryItems.length === 0) {
            return res.status(400).json({ error: "Your pantry is empty! Add items to generate recipes." });
        }

        console.log(`Generating recipes for user ${userId}. Biometrics: ${biometrics}`);

        // 2. Initialize Gemini Model
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // 3. Construct Prompt
        const prompt = `
      You are a specialized chef AI.
      My Pantry contains: ${pantryItems.join(", ")}.
      
      User Profile:
      - Daily Protein Target: ${proteinTarget}g
      - Diet Check: ${dietTags || "None"}
      - Biometrics: ${biometrics}
      - Cuisine: ${cuisine}

      Task: Suggest 3 distinct, delicious ${cuisine} recipes that I can make using primarily these ingredients.
      Consider my biometrics for portion sizes and macro ratios.
      They MUST align with the dietary preferences (e.g. if Vegetarian, NO meat).
      
      Return valid JSON ONLY. No markdown, no "json" label.
      Format:
      {
        "recipes": [
          {
            "title": "Recipe Name",
            "time": "30m",
            "difficulty": "Easy/Medium/Hard",
            "calories": "500 kcal",
            "protein": "30g", // Highlight protein content
            "description": "Brief appetizing description.",
            "usedIngredients": ["Chicken", "Pasta"],
            "missingIngredients": ["Heavy Cream"],
            "instructions": ["Step 1...", "Step 2..."]
          }
        ]
      }
    `;

        // 4. Generate Content
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        console.log("Raw Gemini Recipe Response:", responseText);

        // 5. Clean & Parse JSON
        let jsonText = responseText.trim();
        if (jsonText.startsWith("```json")) {
            jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
        } else if (jsonText.startsWith("```")) {
            jsonText = jsonText.replace(/```\n?/g, "");
        }

        const data = JSON.parse(jsonText);

        res.json({ recipes: data.recipes });

    } catch (error: any) {
        console.error("Error generating recipes:", error);
        res.status(500).json({
            error: "Failed to generate recipes",
            details: error.message
        });
    }
};
