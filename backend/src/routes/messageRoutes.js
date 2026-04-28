import { Router } from "express";
import { getChatHistory } from "../controllers/messageController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/:userId", requireAuth, getChatHistory);

export default router;

