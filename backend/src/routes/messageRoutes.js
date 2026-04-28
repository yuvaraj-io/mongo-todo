import { Router } from "express";
import {
  getChatHistory,
  getUnreadSummary,
  markConversationRead
} from "../controllers/messageController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/unread-summary", requireAuth, getUnreadSummary);
router.patch("/read/:userId", requireAuth, markConversationRead);
router.get("/:userId", requireAuth, getChatHistory);

export default router;
