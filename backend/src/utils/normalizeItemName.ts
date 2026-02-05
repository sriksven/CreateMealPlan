import groq from "../config/groq";

export async function normalizeItemName(itemName: string): Promise<string> {
  try {
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

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.1,
    });

    const response = completion.choices[0]?.message?.content?.trim() || itemName;

    // Remove any quotes or extra formatting that might sneak in
    return response.replace(/['"]/g, '').trim();
  } catch (error) {
    console.error("Error normalizing item name:", error);
    // If AI fails, return the original name with basic cleanup
    return itemName.trim().charAt(0).toUpperCase() + itemName.trim().slice(1).toLowerCase();
  }
}
