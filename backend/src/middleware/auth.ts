import { Request, Response, NextFunction } from "express";
import { auth } from "../config/firebase";

export async function verifyToken(
  req: any,
  res: Response,
  next: NextFunction
) {
  const token = req.headers.authorization?.split("Bearer ")[1];

  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = await auth.verifyIdToken(token);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

// Alias for consistency
export const authMiddleware = verifyToken;

