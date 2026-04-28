import jwt from "jsonwebtoken";
import { Message } from "./models/Message.js";
import { User } from "./models/User.js";

export function registerSocket(io) {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error("Unauthorized"));
      }
      const parsed = token.startsWith("Bearer ") ? token.slice(7) : token;
      const payload = jwt.verify(parsed, process.env.JWT_SECRET || "change_me");
      const user = await User.findById(payload.sub);
      if (!user) {
        return next(new Error("Unauthorized"));
      }
      socket.user = user;
      next();
    } catch (_error) {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    const currentUserId = socket.user._id.toString();
    socket.join(currentUserId);

    socket.on("chat:send", async ({ receiverId, content }) => {
      try {
        const messageText = (content || "").trim();
        if (!receiverId || !messageText) {
          return;
        }

        const isFriend = socket.user.friends.some((id) => id.toString() === receiverId);
        if (!isFriend) {
          return;
        }

        const message = await Message.create({
          senderId: socket.user._id,
          receiverId,
          content: messageText
        });

        io.to(currentUserId).to(receiverId).emit("chat:message", message);
      } catch (error) {
        console.error("Socket send error:", error.message);
      }
    });
  });
}

