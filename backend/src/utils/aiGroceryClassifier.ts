import groq from "../config/groq";
import { isGroceryItem } from "./isGroceryItem";

export async function classifyGroceryItem(itemName: string): Promise<{
    isGrocery: boolean;
    confidence: number;
    reasoning: string;
}> {
    try {
        const prompt = `Classify if "${itemName}" is a grocery/food item that belongs in a pantry inventory.

Return ONLY a JSON object (no markdown, no code blocks):
{
  "isGrocery": true/false,
  "confidence": 0.0-1.0,
  "reasoning": "brief explanation"
}

Grocery items include: food, beverages, cooking ingredients, spices, snacks.
Non-grocery: electronics, furniture, clothing, toiletries, household cleaning items, office supplies.`;

        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
            temperature: 0.1,
            response_format: { type: "json_object" } // Force JSON mode if supported or just helps context
        });

        const response = completion.choices[0]?.message?.content || "{}";

        // Parse JSON from response
        let jsonText = response.trim();
        if (jsonText.startsWith("```json")) {
            jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
        } else if (jsonText.startsWith("```")) {
            jsonText = jsonText.replace(/```\n?/g, "");
        }

        return JSON.parse(jsonText);
    } catch (error) {
        console.error(`[AI Classifier] Failed for "${itemName}":`, error);
        // Fallback to pattern matching
        const isGrocery = isGroceryItem(itemName);
        return {
            isGrocery,
            confidence: 0.7,
            reasoning: "Fallback to pattern matching"
        };
    }
}

// Batch classification for multiple items (more efficient)
export async function classifyGroceryItems(items: string[]): Promise<{
    isGrocery: boolean;
    confidence: number;
}[]> {
    try {
        console.log(`[AI Classifier] Classifying ${items.length} items:`, items);

        const prompt = `Classify each item as grocery (food/pantry item) or non-grocery.

Items to classify:
${items.map((item, i) => `${i + 1}. ${item}`).join('\n')}

Return ONLY a JSON array with one object per item, in the same order:
[{"isGrocery": true, "confidence": 0.95}, {"isGrocery": false, "confidence": 0.9}, ...]

Grocery = food, beverages, cooking ingredients, spices
Non-grocery = electronics, furniture, clothing, toiletries, cleaning products, office supplies`;

        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
            temperature: 0.1,
        });

        const response = completion.choices[0]?.message?.content || "[]";

        console.log(`[AI Classifier] Raw response:`, response);

        let jsonText = response.trim();
        if (jsonText.startsWith("```json")) {
            jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
        } else if (jsonText.startsWith("```")) {
            jsonText = jsonText.replace(/```\n?/g, "");
        }

        const classifications = JSON.parse(jsonText);
        console.log(`[AI Classifier] Parsed classifications:`, classifications);

        return classifications;
    } catch (error) {
        console.error("[AI Classifier] Batch classification failed:", error);
        console.log("[AI Classifier] Falling back to pattern matching");

        // Fallback to pattern matching for all items
        return items.map(itemName => ({
            isGrocery: isGroceryItem(itemName),
            confidence: 0.7
        }));
    }
}
