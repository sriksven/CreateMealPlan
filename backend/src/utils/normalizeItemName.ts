import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function normalizeItemName(itemName: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ 
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash" 
    });

    const prompt = `You are a food item name normalizer. Given a food item name (which may have typos, plural/singular variations, or different spellings), return ONLY the standardized, singular form of the item name in proper case.

Examples:
- "tomato" → "Tomato"
- "tomates" → "Tomato"
- "tomatos" → "Tomato"
- "brocoli" → "Broccoli"
- "bananas" → "Banana"
- "chicken breast" → "Chicken Breast"
- "bred" → "Bread"

Input: "${itemName}"

Return ONLY the corrected name, nothing else:`;

    const result = await model.generateContent(prompt);
    const response = result.response.text().trim();
    
    // Remove any quotes or extra formatting
    return response.replace(/['"]/g, '').trim();
  } catch (error) {
    console.error("Error normalizing item name:", error);
    // If AI fails, return the original name with basic cleanup
    return itemName.trim().charAt(0).toUpperCase() + itemName.trim().slice(1).toLowerCase();
  }
}
