import { Todo } from "../models/Todo.js";
import { User } from "../models/User.js";

export async function getOwnTodos(req, res, next) {
  try {
    const todos = await Todo.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.json({ todos });
  } catch (error) {
    next(error);
  }
}

export async function createTodo(req, res, next) {
  try {
    const title = req.body.title?.trim();
    if (!title) {
      return res.status(400).json({ message: "Todo title is required." });
    }

    const todo = await Todo.create({ owner: req.user._id, title });
    res.status(201).json({ todo });
  } catch (error) {
    next(error);
  }
}

export async function updateTodo(req, res, next) {
  try {
    const updates = {};
    if (typeof req.body.title === "string") {
      const title = req.body.title.trim();
      if (!title) {
        return res.status(400).json({ message: "Todo title is required." });
      }
      updates.title = title;
    }
    if (typeof req.body.completed === "boolean") {
      updates.completed = req.body.completed;
    }
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No valid fields provided." });
    }

    const todo = await Todo.findOneAndUpdate(
      { _id: req.params.todoId, owner: req.user._id },
      updates,
      { new: true, runValidators: true }
    );

    if (!todo) {
      return res.status(404).json({ message: "Todo not found." });
    }
    res.json({ todo });
  } catch (error) {
    next(error);
  }
}

export async function deleteTodo(req, res, next) {
  try {
    const todo = await Todo.findOneAndDelete({ _id: req.params.todoId, owner: req.user._id });
    if (!todo) {
      return res.status(404).json({ message: "Todo not found." });
    }
    res.status(204).end();
  } catch (error) {
    next(error);
  }
}

export async function getTodosByUsername(req, res, next) {
  try {
    const targetUser = await User.findOne({ username: req.params.username });
    if (!targetUser) {
      return res.status(404).json({ message: "User not found." });
    }

    const currentId = req.user._id.toString();
    const targetId = targetUser._id.toString();
    const isSelf = currentId === targetId;
    const isFriend = req.user.friends.some((id) => id.toString() === targetId);

    if (!isSelf && !isFriend) {
      return res.status(403).json({ message: "Only friends can view these todos." });
    }

    const todos = await Todo.find({ owner: targetUser._id }).sort({ createdAt: -1 });
    res.json({ owner: targetUser.username, todos });
  } catch (error) {
    next(error);
  }
}

