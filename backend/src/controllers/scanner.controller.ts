import { Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { addItemsToPantry } from "./pantry.controller";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const scanReceipt = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }

    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || "gemini-2.5-flash" });

    // Convert image buffer to base64
    const imageData = req.file.buffer.toString("base64");

    const prompt = `Analyze this grocery receipt or food item image and extract all food items. 
For each item, provide:
- name: the food item name
- quantity: the numeric amount
- unit: the unit of measurement (e.g., kg, lbs, oz, items, count)
- count: optional number of packages/items

Return ONLY a valid JSON array in this exact format, nothing else:
[{"name":"Item Name","quantity":"1","unit":"kg","count":"2"}]

Focus on food and grocery items only. Skip non-food items like bags, receipts, etc.`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: req.file.mimetype,
          data: imageData,
        },
      },
    ]);

    const response = result.response.text();
    console.log("Gemini response:", response);

    // Extract JSON from response (handle markdown code blocks)
    let jsonText = response.trim();
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/```\n?/g, "");
    }

    const items = JSON.parse(jsonText);

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "No valid items found in the image" });
    }

    res.status(200).json({ items });
  } catch (error) {
    console.error("Error scanning receipt:", error);
    res.status(500).json({ error: "Failed to scan receipt" });
  }
};

export const saveScannedItems = async (req: Request, res: Response) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "No items provided" });
    }

    // Use the pantry controller to save items
    await addItemsToPantry(req, res);
  } catch (error) {
    console.error("Error saving scanned items:", error);
    res.status(500).json({ error: "Failed to save items" });
  }
};
