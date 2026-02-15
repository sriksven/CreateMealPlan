import { Request, Response } from "express";
import { db } from "../config/firebase";

export const getProfile = async (req: any, res: Response) => {
  try {
    const userId = req.user.uid;

    const ref = db.collection("users").doc(userId);
    const snap = await ref.get();

    if (!snap.exists) {
      await ref.set({
        proteinTarget: 140,
        measurementUnit: 'metric',
        createdAt: new Date()
      });
    }

    const data = (await ref.get()).data();
    res.status(200).json(data);
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({ error: "Failed to load profile" });
  }
};

export const updateProfile = async (req: any, res: Response) => {
  try {
    const userId = req.user.uid;
    const { proteinTarget, tags, gender, weight, height, measurementUnit } = req.body;
    const updateData: any = { updatedAt: new Date() };

    if (proteinTarget !== undefined) {
      if (typeof proteinTarget !== "number" || proteinTarget < 30 || proteinTarget > 300) {
        return res.status(400).json({ error: "Invalid protein target" });
      }
      updateData.proteinTarget = proteinTarget;
    }

    const { calorieTarget } = req.body;
    if (calorieTarget !== undefined) {
      const cal = Number(calorieTarget);
      if (typeof cal !== "number" || cal < 500 || cal > 10000) {
        return res.status(400).json({ error: "Invalid calorie target" });
      }
      updateData.calorieTarget = cal;
    }

    if (tags !== undefined) {
      if (!Array.isArray(tags)) {
        return res.status(400).json({ error: "Tags must be an array" });
      }
      updateData.tags = tags;
    }

    if (gender) updateData.gender = gender;
    if (weight) updateData.weight = Number(weight);
    if (height) updateData.height = Number(height);

    if (measurementUnit !== undefined) {
      console.log('Received measurementUnit:', measurementUnit);
      if (measurementUnit !== 'metric' && measurementUnit !== 'imperial') {
        return res.status(400).json({ error: "Invalid measurement unit. Must be 'metric' or 'imperial'" });
      }
      updateData.measurementUnit = measurementUnit;
      console.log('Setting measurementUnit to:', measurementUnit);
    }

    await db.collection("users").doc(userId).set(updateData, { merge: true });

    res.status(200).json({
      message: "Profile updated",
      ...updateData
    });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ error: "Failed to update profile" });
  }
};
// Wipes all user data (pantry items and history)
export const resetUserData = async (req: any, res: Response) => {
  try {
    const userId = req.user.uid;
    console.log(`Resetting data for user: ${userId}`);

    const batch = db.batch();
    let deleteCount = 0;
    const MAX_BATCH_SIZE = 450; // Firestore limit is 500, keep safety margin

    // 1. Get all pantry items
    const pantryDocs = await db.collection("pantry").where("userId", "==", userId).get();

    pantryDocs.docs.forEach((doc) => {
      batch.delete(doc.ref);
      deleteCount++;
    });

    // 2. Get all history
    const historyDocs = await db.collection("pantry_history").where("uid", "==", userId).get();

    // Note: If total docs > 500, we need chunks. 
    // For simplicity in this v1, assuming < 500 docs usually.
    // If > 500, we simply iterate batches.

    // Let's implement a simple chunked delete if needed, but for now single batch is likely fine for personal pantry.
    // If strict safety needed:
    if (deleteCount + historyDocs.size > MAX_BATCH_SIZE) {
      // Fallback: Delete one by one if too huge (slow but safe) or commit multiple batches.
      // Let's do multiple batches.
      // Actually, easiest is to just delete in parallel promises if not transaction.
      // But let's stick to batch for atomicity if possible, or just loose deletions.

      // For "Reset Data", atomicity isn't critical. Just delete everything.
      const promises: Promise<any>[] = [];
      pantryDocs.docs.forEach(d => promises.push(d.ref.delete()));
      historyDocs.docs.forEach(d => promises.push(d.ref.delete()));
      await Promise.all(promises);
    } else {
      historyDocs.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
    }

    console.log(`Deleted ${pantryDocs.size} pantry items and ${historyDocs.size} history records.`);

    res.status(200).json({
      message: "Account data reset successfully",
      details: {
        pantryItemsDeleted: pantryDocs.size,
        historyDeleted: historyDocs.size
      }
    });

  } catch (err) {
    console.error("Reset data error:", err);
    res.status(500).json({ error: "Failed to reset data" });
  }
};

// Analyze biometrics using Groq
import groq from "../config/groq";

export const analyzeBiometrics = async (req: Request, res: Response) => {
  try {
    const { gender, weight, height, age } = req.body;

    if (!weight || !height || !gender) {
      return res.status(400).json({ error: "Missing biometrics (weight, height, gender)" });
    }

    const prompt = `
      As a Nutritionist AI, analyze this profile:
      - Gender: ${gender}
      - Weight: ${weight} kg
      - Height: ${height} cm
      ${age ? `- Age: ${age}` : ''}

      1. Calculate BMI and determine status (Underweight, Normal, Overweight, Obese).
      2. Suggest an Ideal Weight Range.
      3. Recommend Daily Protein Target (g) for a healthy lifestyle.
      4. Suggest Daily Calorie Target for maintenance.

      Return ONLY valid JSON:
      {
        "bmi": number,
        "status": "string", // e.g. "Overweight"
        "idealWeightRange": "string", // e.g. "65-72 kg"
        "proteinTarget": number,
        "calorieTarget": number,
        "tip": "string" // A brief, encouraging 1-sentence tip
      }
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.5,
      response_format: { type: "json_object" }
    });

    const responseContent = chatCompletion.choices[0]?.message?.content;
    const data = responseContent ? JSON.parse(responseContent) : null;

    if (!data) throw new Error("No data received from AI");

    res.json(data);

  } catch (err) {
    console.error("AI Analysis Error:", err);
    res.status(500).json({ error: "Failed to analyze biometrics" });
  }
};
