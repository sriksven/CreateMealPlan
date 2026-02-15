import { Request, Response } from "express";
import openai from "../config/openai";
import { db } from "../config/firebase";

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

    // Get pantry items with weights and units
    const pantryItems = pantrySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        name: data.name,
        quantity: data.quantity || data.weight,
        unit: data.unit || data.weightUnit
      };
    });

    // Get Dietary Goals and Measurement Preference
    const userData = userDoc.data();
    const proteinTarget = userData?.proteinTarget || 150; // Default
    const dietTags = userData?.tags && Array.isArray(userData.tags) ? userData.tags.join(", ") : "";
    const measurementUnit = userData?.measurementUnit || 'metric'; // Get user's preferred system

    // Biometrics
    const biometrics = `
      Gender: ${userData?.gender || 'N/A'}
      Weight: ${userData?.weight ? userData.weight + 'kg' : 'N/A'}
      Height: ${userData?.height ? userData.height + 'cm' : 'N/A'}
    `;

    // 2. Convert weights to user's preferred system
    const convertToPreferredSystem = (qty: string, unit: string) => {
      const numQty = parseFloat(qty);
      if (isNaN(numQty)) return `${qty} ${unit}`;

      // If already in preferred system, return as-is
      const metricUnits = ['kg', 'g', 'L', 'ml'];
      const imperialUnits = ['lb', 'oz', 'cup', 'tbsp', 'tsp'];

      const isMetric = metricUnits.includes(unit);
      const isImperial = imperialUnits.includes(unit);

      if (measurementUnit === 'metric' && isMetric) {
        return `${numQty}${unit}`;
      }
      if (measurementUnit === 'imperial' && isImperial) {
        return `${numQty}${unit}`;
      }

      // Convert if needed
      if (measurementUnit === 'metric' && isImperial) {
        // Convert to metric
        if (unit === 'lb') return `${(numQty * 0.453592).toFixed(0)}g`;
        if (unit === 'oz') return `${(numQty * 28.3495).toFixed(0)}g`;
        if (unit === 'cup') return `${(numQty * 236.588).toFixed(0)}ml`;
      } else if (measurementUnit === 'imperial' && isMetric) {
        // Convert to imperial
        if (unit === 'kg') return `${(numQty / 0.453592).toFixed(2)}lb`;
        if (unit === 'g') return `${(numQty / 28.3495).toFixed(2)}oz`;
        if (unit === 'L' || unit === 'ml') {
          const ml = unit === 'L' ? numQty * 1000 : numQty;
          return `${(ml / 236.588).toFixed(2)}cup`;
        }
      }

      return `${numQty}${unit}`;
    };

    // Format pantry items with quantities
    const pantryList = pantryItems
      .filter(item => item.quantity && item.unit)
      .map(item => `${item.name}: ${convertToPreferredSystem(item.quantity, item.unit)}`)
      .join(", ");

    if (!pantryList) {
      return res.status(400).json({ error: "Your pantry is empty or has no weight information! Add items with weights to generate recipes." });
    }

    console.log(`Generating recipes for user ${userId}. Measurement system: ${measurementUnit}`);

    // 3. Construct Prompt with weights in preferred units
    const unitSystem = measurementUnit === 'metric' ? 'METRIC (g, kg, ml, L)' : 'IMPERIAL (oz, lb, cup, tbsp, tsp)';
    const prompt = `
      You are a specialized chef AI.
      My Pantry contains: ${pantryList}.
      
      User Profile:
      - Daily Protein Target: ${proteinTarget}g
      - Diet Check: ${dietTags || "None"}
      - Biometrics: ${biometrics}
      - Cuisine: ${cuisine}
      - Preferred Measurement System: ${measurementUnit.toUpperCase()}

      Task: Suggest 3 distinct, delicious ${cuisine} recipes that I can make using primarily these ingredients.
      Consider my biometrics for portion sizes and macro ratios.
      They MUST align with the dietary preferences (e.g. if Vegetarian, NO meat).
      
      IMPORTANT: All ingredient measurements in the recipes MUST be in ${unitSystem} units.
      Use the EXACT quantities from my pantry or proportional amounts.
      
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
    const result = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const responseText = result.choices[0].message.content || "{}";

    console.log("Raw OpenAI Recipe Response:", responseText);

    const data = JSON.parse(responseText);


    res.json({ recipes: data.recipes });

  } catch (error: any) {
    console.error("Error generating recipes:", error);
    res.status(500).json({
      error: "Failed to generate recipes",
      details: error.message
    });
  }
};
