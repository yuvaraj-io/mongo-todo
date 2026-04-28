import { User } from "../models/User.js";

export async function searchUsers(req, res, next) {
  try {
    const q = (req.query.q || "").trim();
    if (!q) {
      return res.json({ users: [] });
    }

    const users = await User.find({
      username: { $regex: q, $options: "i" },
      _id: { $ne: req.user._id }
    })
      .select("username email bio profileImage friends sentRequests receivedRequests")
      .limit(20);

    res.json({ users });
  } catch (error) {
    next(error);
  }
}

