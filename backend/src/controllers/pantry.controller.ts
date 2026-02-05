import { Request, Response } from "express";
import { db } from "../config/firebase";
import { categorizeItem } from "../utils/categorize";
import { normalizeItemName } from "../utils/normalizeItemName";

interface PantryItem {
  name: string;
  quantity: string;
  unit: string;

  // Standardized weight-based fields
  totalCount?: number;
  totalWeight?: number; // in grams

  count?: string;
  category?: string;
  expiryDate?: string;
  addedDate: string;
  userId: string;
}

// Add items to pantry
// Helper to sum quantities
// Helper to convert to grams
const convertToGrams = (qty: number, unit: string): number => {
  const u = unit.toLowerCase().trim();
  switch (u) {
    case 'kg':
    case 'kilogram':
    case 'kilograms':
      return qty * 1000;
    case 'lb':
    case 'lbs':
    case 'pound':
    case 'pounds':
      return qty * 453.592;
    case 'oz':
    case 'ounce':
    case 'ounces':
      return qty * 28.3495;
    case 'g':
    case 'gram':
    case 'grams':
      return qty;
    default:
      return 0; // Unknown unit or just count
  }
};

// Helper to convert from grams to target unit
const convertFromGrams = (grams: number, unit: string): number => {
  const u = unit.toLowerCase().trim();
  switch (u) {
    case 'kg':
    case 'kilogram':
    case 'kilograms':
      return grams / 1000;
    case 'lb':
    case 'lbs':
    case 'pound':
    case 'pounds':
      return grams / 453.592;
    case 'oz':
    case 'ounce':
    case 'ounces':
      return grams / 28.3495;
    default:
      return grams; // Default to grams if unit is g or unknown weight unit
  }
};

const isWeightUnit = (unit: string): boolean => {
  return ['g', 'gram', 'grams', 'kg', 'kilogram', 'kilograms', 'lb', 'lbs', 'pound', 'pounds', 'oz', 'ounce', 'ounces', 'l', 'ml'].includes(unit.toLowerCase());
}

// Add items to pantry
export const addItemsToPantry = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.uid;
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "No items provided" });
    }

    const batch = db.batch();
    const pantryRef = db.collection("pantry");
    const addedItems: any[] = [];
    const mergedItems: any[] = [];

    for (const item of items) {
      // Normalize each item name using AI
      const normalizedName = await normalizeItemName(item.name);

      // Determine input values
      let inputCount = 0;
      let inputWeight = 0; // in grams

      // Parse explicit fields if available (from new UI)
      if (item.count) inputCount = parseFloat(item.count) || 0;
      if (item.weight) {
        inputWeight = convertToGrams(parseFloat(item.weight) || 0, item.weightUnit || 'g');
      }

      // Handle legacy/flexible input (from scanner or old UI)
      const rawQty = parseFloat(item.quantity);
      if (!isNaN(rawQty)) {
        const unit = (item.unit || "").toLowerCase();
        // If unit is a weight unit and no explicit weight, treat as weight
        if (isWeightUnit(unit)) {
          if (inputWeight === 0) inputWeight = convertToGrams(rawQty, unit);
          if (inputCount === 0) inputCount = 1; // Default to 1 count if purely weight provided? Or 0? 
          // Logic: If I buy "1 lb Chicken", Count=1? Or 0? 
          // User said: "weight is consistent... 2 tomatoes...". 
          // If weight is primary, count might be irrelevant or 0. Let's keep 0 if unknown.
          // Actually, safer to leave as 0 if unknown, but then we might lose "1 bag" count context.
          // Let's stick to 1 if count is strictly 0 and it's from legacy input.
          if (inputCount === 0) inputCount = 1;
        } else {
          // Treat as count
          if (inputCount === 0) inputCount = rawQty;
        }
      }

      // Check for strictly normalized existence (ignoring date/unit)
      const existingQuery = await pantryRef
        .where("userId", "==", userId)
        .where("name", "==", normalizedName)
        .get();

      let merged = false;

      // Aggressive Merge: If ANY row exists, pick the first one.
      if (!existingQuery.empty) {
        // Merge into the first found document
        const doc = existingQuery.docs[0];
        const data = doc.data();

        // Calculate new totals
        const currentCount = data.totalCount || parseFloat(data.quantity) || 0;
        const currentWeight = data.totalWeight || 0;

        const newCount = currentCount + inputCount;
        const newWeight = currentWeight + inputWeight;

        // Determine display values
        // Prefer NEW unit if available, or keep OLD unit
        const displayUnit = item.weightUnit || item.unit || data.unit || "";
        let displayQuantity = newCount.toString(); // Default to count

        if (isWeightUnit(displayUnit)) {
          // If unit is weight-based, display the converted weight
          // Use 1 decimal place?
          const val = convertFromGrams(newWeight, displayUnit);
          displayQuantity = val % 1 === 0 ? val.toString() : val.toFixed(2).replace(/\.?0+$/, '');
        }

        batch.update(doc.ref, {
          totalCount: newCount,
          totalWeight: newWeight,
          // Update display fields to reflect latest TOTALS
          quantity: displayQuantity,
          unit: displayUnit,
          updatedDate: new Date().toISOString()
        });

        mergedItems.push({
          id: doc.id,
          name: normalizedName,
          totalCount: newCount,
          totalWeight: newWeight,
          merged: true
        });

        // History logs the *added* amount
        addedItems.push({
          id: doc.id,
          name: normalizedName,
          quantity: item.quantity,
          unit: item.unit,
          count: inputCount,
          weight: inputWeight,
          category: data.category || "",
          expiryDate: item.expiryDate || "",
          addedDate: new Date().toISOString(),
          userId,
          merged: true
        });

        merged = true;
      }

      if (!merged) {
        // Determine display quantity for new item
        const displayUnit = item.weightUnit || item.unit || "";
        let displayQuantity = inputCount.toString();

        if (isWeightUnit(displayUnit) && inputWeight > 0) {
          const val = convertFromGrams(inputWeight, displayUnit);
          displayQuantity = val % 1 === 0 ? val.toString() : val.toFixed(2).replace(/\.?0+$/, '');
        }

        // If pure count and 0? (e.g. 500g sugar, count 1?)
        if (displayQuantity === "0" && inputWeight > 0) {
          // Should have been handled by isWeightUnit check
        }

        const pantryItem: PantryItem = {
          name: normalizedName,
          quantity: displayQuantity,
          unit: displayUnit,

          // New standardized fields
          totalCount: inputCount,
          totalWeight: inputWeight,

          count: inputCount.toString(),
          category: item.category || categorizeItem(normalizedName),
          expiryDate: item.expiryDate || "",
          addedDate: new Date().toISOString(),
          userId,
        };

        const docRef = pantryRef.doc();
        batch.set(docRef, pantryItem);
        addedItems.push({ id: docRef.id, ...pantryItem, merged: false });
      }
    }

    await batch.commit();

    // Track history
    try {
      const source = (req.body.source as 'manual' | 'receipt') || 'manual';
      const metadata = req.body.metadata || null;

      await db.collection("pantry_history").add({
        uid: userId,
        items: addedItems,
        source: source,
        metadata: metadata,
        timestamp: new Date(),
        count: items.length,
      });
    } catch (historyError) {
      console.error("Failed to save history:", historyError);
    }

    res.status(201).json({
      message: `${addedItems.length} items processed (${mergedItems.length} merged)`,
      items: addedItems,
    });
  } catch (error) {
    console.error("Error adding items to pantry:", error);
    res.status(500).json({ error: "Failed to add items to pantry" });
  }
};

// Get all pantry items for a user
export const getPantryItems = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.uid;

    const snapshot = await db
      .collection("pantry")
      .where("userId", "==", userId)
      .get();

    const items = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Sort by addedDate in memory instead of in Firestore
    items.sort((a: any, b: any) => {
      const dateA = new Date(a.addedDate || 0).getTime();
      const dateB = new Date(b.addedDate || 0).getTime();
      return dateB - dateA; // Descending order (newest first)
    });

    res.status(200).json({ items });
  } catch (error) {
    console.error("Error fetching pantry items:", error);
    res.status(500).json({ error: "Failed to fetch pantry items" });
  }
};

// Update a pantry item
export const updatePantryItem = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.uid;
    const itemId = req.params.itemId as string;
    const updates = req.body;

    // Verify ownership
    const docRef = db.collection("pantry").doc(itemId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Item not found" });
    }

    if (doc.data()?.userId !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await docRef.update({
      ...updates,
      updatedDate: new Date().toISOString(),
    });

    res.status(200).json({ message: "Item updated successfully" });
  } catch (error) {
    console.error("Error updating pantry item:", error);
    res.status(500).json({ error: "Failed to update item" });
  }
};

// Delete a pantry item
export const deletePantryItem = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.uid;
    const itemId = req.params.itemId as string;

    // Verify ownership
    const docRef = db.collection("pantry").doc(itemId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Item not found" });
    }

    if (doc.data()?.userId !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await docRef.delete();

    res.status(200).json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error("Error deleting pantry item:", error);
    res.status(500).json({ error: "Failed to delete item" });
  }
};

// Add a single item manually
// Add a single item manually -> Delegates to addItemsToPantry for consistent logic
export const addSingleItem = async (req: Request, res: Response) => {
  try {
    // Wrap single item in array and delegate
    req.body.items = [{
      name: req.body.name,
      quantity: req.body.quantity,
      unit: req.body.unit,
      count: req.body.count,
      weight: req.body.weight,
      weightUnit: req.body.weightUnit,
      category: req.body.category,
      expiryDate: req.body.expiryDate
    }];

    // We can't just call addItemsToPantry directly if it expects req.body.items to be there (which we just set)
    // But we need to handle the response correctly since addItemsToPantry sends a response.
    // It's cleaner to reuse the core logic but passing req/res is fine here since we modified req.body.
    return await addItemsToPantry(req, res);
  } catch (error) {
    console.error("Error adding single item:", error);
    res.status(500).json({ error: "Failed to add item" });
  }
};
