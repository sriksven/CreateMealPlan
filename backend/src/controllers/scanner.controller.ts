import { Request, Response } from "express";
import openai from "../config/openai";
import { addItemsToPantry } from "./pantry.controller";
import { classifyGroceryItems } from "../utils/aiGroceryClassifier";
import { db } from "../config/firebase";

export const scanReceipt = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }

    const model = process.env.OPENAI_MODEL || "gpt-4o";

    // Convert image buffer to base64
    const imageData = req.file.buffer.toString("base64");

    const prompt = `Analyze this receipt image and extract the merchant details and ALL items purchased.

Return ONLY a valid JSON object in this exact format:
{
  "merchantName": "Store Name",
  "date": "YYYY-MM-DD" (or null if not found),
  "totalAmount": "0.00" (or null if not found),
  "items": [
    {
      "name": "Item Name (standardized singular, e.g. 'Apple' not 'Apples')",
      "count": "5" (if discrete count available, else null),
      "weight": "1.5" (if weight available, else null),
      "weightUnit": "lb" (e.g. kg, g, lb, oz, else null),
      "quantity": "1" (legacy fallback: prefer count or weight value),
      "unit": "bag" (legacy fallback: if no weight unit)
    }
  ]
}

Extract EVERY item. 
- Separation: If an item has both count and weight (e.g. "2 bags of 500g"), capture BOTH.
- Accuracy: If date/total is unclear, use null.`;

    const result = await openai.chat.completions.create({
      model: model,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: `data:${req.file.mimetype};base64,${imageData}`,
              },
            },
          ],
        },
      ],
      response_format: { type: "json_object" },
    });

    const response = result.choices[0].message.content || "{}";
    console.log("OpenAI response:", response);


    // Extract JSON from response
    let jsonText = response.trim();
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/```\n?/g, "");
    }

    const data = JSON.parse(jsonText);
    const items = data.items || [];
    const metadata = {
      merchantName: data.merchantName,
      date: data.date,
      totalAmount: data.totalAmount
    };

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "No valid items found in the image" });
    }

    // Check for duplicate receipt
    let possibleDuplicate = false;
    let lastScannedAt = null;

    if (metadata.date && metadata.totalAmount && metadata.merchantName) {
      const userId = (req as any).user.uid;

      // Check history for similar receipt
      // We can't do complex multiple-field where clauses without composite indexes in Firestore
      // So we fetch by one field (e.g., date or just last 50 scans) and filter in memory
      const historySnapshot = await db.collection("pantry_history")
        .where("uid", "==", userId)
        .where("source", "==", "receipt")
        .limit(50)
        .get();

      historySnapshot.docs.forEach((doc: any) => {
        const historyData = doc.data();
        if (historyData.metadata) {
          if (
            historyData.metadata.date === metadata.date &&
            historyData.metadata.totalAmount === metadata.totalAmount &&
            historyData.metadata.merchantName === metadata.merchantName
          ) {
            possibleDuplicate = true;
            lastScannedAt = historyData.timestamp;
          }
        }
      });
    }

    // Use AI to classify items in batch
    console.log("Classifying items with AI...");
    const itemNames = items.map((item: any) => item.name);
    const classifications = await classifyGroceryItems(itemNames);

    // Combine items with their classifications
    const classifiedItems = items.map((item: any, index: number) => ({
      ...item,
      isGrocery: classifications[index].isGrocery,
      confidence: classifications[index].confidence,
    }));

    res.status(200).json({
      items: classifiedItems,
      metadata,
      possibleDuplicate,
      lastScannedAt
    });
  } catch (error: any) {
    console.error("Error scanning receipt:", error);
    const errorMessage = error.message || "Unknown error";
    res.status(500).json({
      error: "Failed to scan receipt",
      details: errorMessage
    });
  }
};

export const saveScannedItems = async (req: Request, res: Response) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "No items provided" });
    }

    // Use the pantry controller to save items
    req.body.source = 'receipt';
    await addItemsToPantry(req, res);
  } catch (error) {
    console.error("Error saving scanned items:", error);
    res.status(500).json({ error: "Failed to save items" });
  }
};
