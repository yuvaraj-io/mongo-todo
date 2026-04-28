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

export async function getUnreadSummary(req, res, next) {
  try {
    const receiverId = req.user._id;
    const grouped = await Message.aggregate([
      {
        $match: {
          receiverId,
          isRead: false
        }
      },
      {
        $group: {
          _id: "$senderId",
          count: { $sum: 1 }
        }
      }
    ]);

    const byUser = grouped.reduce((acc, item) => {
      acc[item._id.toString()] = item.count;
      return acc;
    }, {});
    const total = grouped.reduce((sum, item) => sum + item.count, 0);

    res.json({ total, byUser });
  } catch (error) {
    next(error);
  }
}

export async function markConversationRead(req, res, next) {
  try {
    const senderId = req.params.userId;
    await Message.updateMany(
      {
        senderId,
        receiverId: req.user._id,
        isRead: false
      },
      {
        $set: { isRead: true }
      }
    );

    res.json({ message: "Conversation marked as read." });
  } catch (error) {
    next(error);
  }
}
