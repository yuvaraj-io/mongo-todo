import { Router } from "express";
import {
  getProfileByUsername,
  updateProfile
} from "../controllers/profileController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";
import { uploadProfileImage } from "../middlewares/uploadMiddleware.js";

const router = Router();

router.put("/update", requireAuth, uploadProfileImage, updateProfile);
router.get("/:username", getProfileByUsername);

export default router;
