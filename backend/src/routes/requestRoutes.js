import { Router } from "express";
import {
  acceptRequest,
  rejectRequest,
  sendRequest
} from "../controllers/requestController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/send/:userId", requireAuth, sendRequest);
router.post("/accept/:userId", requireAuth, acceptRequest);
router.post("/reject/:userId", requireAuth, rejectRequest);

export default router;

