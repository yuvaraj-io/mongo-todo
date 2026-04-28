import { Message } from "../models/Message.js";

export async function getChatHistory(req, res, next) {
  try {
    const otherUserId = req.params.userId;
    const isFriend = req.user.friends.some((id) => id.toString() === otherUserId);

    if (!isFriend) {
      return res.status(403).json({ message: "You can only chat with friends." });
    }

    const messages = await Message.find({
      $or: [
        { senderId: req.user._id, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: req.user._id }
      ]
    }).sort({ createdAt: 1 });

    res.json({ messages });
  } catch (error) {
    next(error);
  }
}

