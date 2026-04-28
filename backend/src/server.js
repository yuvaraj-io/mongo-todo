import dotenv from "dotenv";
import http from "node:http";
import { Server } from "socket.io";
import { createApp } from "./app.js";
import { connectDB } from "./config/db.js";
import { registerSocket } from "./socket.js";

dotenv.config();

const PORT = process.env.PORT || 5050;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/todo_app";
const app = createApp();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173"
  }
});
registerSocket(io);

httpServer.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});

httpServer.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use. Set a different PORT in backend/.env.`);
  } else {
    console.error("Server failed to start:", error.message);
  }

  process.exit(1);
});

connectDB(MONGO_URI).then(() => {
  console.log("MongoDB connected");
}).catch((error) => {
  console.error("MongoDB connection failed:", error.message);
  process.exit(1);
});
