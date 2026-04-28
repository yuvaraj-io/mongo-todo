import { User } from "../models/User.js";

export async function sendRequest(req, res, next) {
  try {
    const currentUser = req.user;
    const targetId = req.params.userId;

    if (currentUser._id.toString() === targetId) {
      return res.status(400).json({ message: "Cannot send request to yourself." });
    }

    const targetUser = await User.findById(targetId);
    if (!targetUser) {
      return res.status(404).json({ message: "Target user not found." });
    }

    const isFriend = currentUser.friends.some((id) => id.toString() === targetId);
    const alreadySent = currentUser.sentRequests.some((id) => id.toString() === targetId);
    const alreadyReceived = currentUser.receivedRequests.some((id) => id.toString() === targetId);
    if (isFriend || alreadySent || alreadyReceived) {
      return res.status(409).json({ message: "Request cannot be sent." });
    }

    currentUser.sentRequests.push(targetUser._id);
    targetUser.receivedRequests.push(currentUser._id);
    await Promise.all([currentUser.save(), targetUser.save()]);

    res.json({ message: "Friend request sent." });
  } catch (error) {
    next(error);
  }
}

export async function acceptRequest(req, res, next) {
  try {
    const currentUser = req.user;
    const senderId = req.params.userId;

    const sender = await User.findById(senderId);
    if (!sender) {
      return res.status(404).json({ message: "User not found." });
    }

    const hasRequest = currentUser.receivedRequests.some((id) => id.toString() === senderId);
    if (!hasRequest) {
      return res.status(400).json({ message: "No pending request from this user." });
    }

    currentUser.receivedRequests = currentUser.receivedRequests.filter(
      (id) => id.toString() !== senderId
    );
    sender.sentRequests = sender.sentRequests.filter(
      (id) => id.toString() !== currentUser._id.toString()
    );

    if (!currentUser.friends.some((id) => id.toString() === senderId)) {
      currentUser.friends.push(sender._id);
    }
    if (!sender.friends.some((id) => id.toString() === currentUser._id.toString())) {
      sender.friends.push(currentUser._id);
    }

    await Promise.all([currentUser.save(), sender.save()]);
    res.json({ message: "Friend request accepted." });
  } catch (error) {
    next(error);
  }
}

export async function rejectRequest(req, res, next) {
  try {
    const currentUser = req.user;
    const senderId = req.params.userId;

    const sender = await User.findById(senderId);
    if (!sender) {
      return res.status(404).json({ message: "User not found." });
    }

    currentUser.receivedRequests = currentUser.receivedRequests.filter(
      (id) => id.toString() !== senderId
    );
    sender.sentRequests = sender.sentRequests.filter(
      (id) => id.toString() !== currentUser._id.toString()
    );
    await Promise.all([currentUser.save(), sender.save()]);

    res.json({ message: "Friend request rejected." });
  } catch (error) {
    next(error);
  }
}

