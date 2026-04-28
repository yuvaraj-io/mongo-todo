import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

    if (!token) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET || "change_me");
    const user = await User.findById(payload.sub);

    if (!user) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    req.user = user;
    next();
  } catch (_error) {
    return res.status(401).json({ message: "Unauthorized." });
  }
}

