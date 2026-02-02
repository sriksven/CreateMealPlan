import { Request, Response } from "express";
import { db } from "../config/firebase";
import { categorizeItem } from "../utils/categorize";
import { normalizeItemName } from "../utils/normalizeItemName";

interface PantryItem {
  name: string;
  quantity: string;
  unit: string;
  count?: string;
  category?: string;
  expiryDate?: string;
  addedDate: string;
  userId: string;
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

    for (const item of items) {
      // Normalize each item name using AI
      const normalizedName = await normalizeItemName(item.name);
      
      const pantryItem: PantryItem = {
        name: normalizedName,
        quantity: item.quantity,
        unit: item.unit,
        count: item.count || "",
        category: item.category || categorizeItem(normalizedName), // Auto-categorize with normalized name
        expiryDate: item.expiryDate || "",
        addedDate: new Date().toISOString(),
        userId,
      };

      const docRef = pantryRef.doc();
      batch.set(docRef, pantryItem);
      addedItems.push({ id: docRef.id, ...pantryItem });
    }

    await batch.commit();

    res.status(201).json({
      message: `${items.length} items added to pantry`,
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
export const addSingleItem = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.uid;
    const { name, quantity, unit, category, expiryDate, count } = req.body;

    if (!name || !quantity || !unit) {
      return res.status(400).json({ error: "Name, quantity, and unit are required" });
    }

    // Normalize the item name using AI
    const normalizedName = await normalizeItemName(name);

    const pantryItem: PantryItem = {
      name: normalizedName,
      quantity,
      unit,
      count: count || "",
      category: category || categorizeItem(normalizedName), // Auto-categorize with normalized name
      expiryDate: expiryDate || "",
      addedDate: new Date().toISOString(),
      userId,
    };

    const docRef = await db.collection("pantry").add(pantryItem);

    res.status(201).json({
      message: "Item added successfully",
      item: { id: docRef.id, ...pantryItem },
    });
  } catch (error) {
    console.error("Error adding item:", error);
    res.status(500).json({ error: "Failed to add item" });
  }
};
