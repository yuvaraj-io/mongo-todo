import { Router } from "express";
import { searchUsers } from "../controllers/userController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/search", requireAuth, searchUsers);

export default router;

