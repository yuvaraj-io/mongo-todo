import cors from "cors";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import authRoutes from "./routes/authRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import requestRoutes from "./routes/requestRoutes.js";
import todoRoutes from "./routes/todoRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { errorHandler, notFound } from "./middlewares/errorMiddleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: process.env.CLIENT_ORIGIN || "http://localhost:5173"
    })
  );
  app.use(express.json());
  app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/profile", profileRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/request", requestRoutes);
  app.use("/api/todos", todoRoutes);
  app.use("/api/messages", messageRoutes);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}

