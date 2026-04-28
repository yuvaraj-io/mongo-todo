import { Router } from "express";
import {
  createTodo,
  deleteTodo,
  getOwnTodos,
  getTodosByUsername,
  updateTodo
} from "../controllers/todoController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/", requireAuth, getOwnTodos);
router.post("/", requireAuth, createTodo);
router.patch("/item/:todoId", requireAuth, updateTodo);
router.delete("/item/:todoId", requireAuth, deleteTodo);
router.get("/:username", requireAuth, getTodosByUsername);

export default router;

