import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/todo_app";
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";
let mongoStatus = "disconnected";

app.use(
  cors({
    origin: CLIENT_ORIGIN
  })
);
app.use(express.json());

const todoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    completed: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

const Todo = mongoose.model("Todo", todoSchema);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", database: mongoStatus });
});

app.use("/api/todos", (_req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message:
        "MongoDB is not connected. Start MongoDB or set MONGO_URI in backend/.env."
    });
  }

  next();
});

app.get("/api/todos", async (_req, res, next) => {
  try {
    const todos = await Todo.find().sort({ createdAt: -1 });
    res.json(todos);
  } catch (error) {
    next(error);
  }
});

app.get("/api/todos/:id", async (req, res, next) => {
  try {
    const todo = await Todo.findById(req.params.id);

    if (!todo) {
      return res.status(404).json({ message: "Todo not found." });
    }

    res.json(todo);
  } catch (error) {
    next(error);
  }
});

app.post("/api/todos", async (req, res, next) => {
  try {
    const title = req.body.title?.trim();

    if (!title) {
      return res.status(400).json({ message: "Todo title is required." });
    }

    const todo = await Todo.create({ title });
    res.status(201).json(todo);
  } catch (error) {
    next(error);
  }
});

app.patch("/api/todos/:id", async (req, res, next) => {
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
      return res.status(400).json({ message: "No valid fields were provided." });
    }

    const todo = await Todo.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!todo) {
      return res.status(404).json({ message: "Todo not found." });
    }

    res.json(todo);
  } catch (error) {
    next(error);
  }
});

app.delete("/api/todos/:id", async (req, res, next) => {
  try {
    const todo = await Todo.findByIdAndDelete(req.params.id);

    if (!todo) {
      return res.status(404).json({ message: "Todo not found." });
    }

    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: "Something went wrong." });
});

mongoose.connection.on("connected", () => {
  mongoStatus = "connected";
  console.log("MongoDB connected");
});

mongoose.connection.on("disconnected", () => {
  mongoStatus = "disconnected";
});

mongoose.connection.on("error", (error) => {
  mongoStatus = "error";
  console.error("MongoDB error:", error.message);
});

const server = app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use. Set a different PORT in backend/.env.`);
  } else {
    console.error("Server failed to start:", error.message);
  }

  process.exit(1);
});

mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 }).catch((error) => {
  mongoStatus = "error";
  console.error("MongoDB connection failed:", error.message);
  console.error("The API is still running, but todo routes need MongoDB.");
});
