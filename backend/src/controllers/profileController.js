import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { toUserView } from "../utils/userView.js";

export async function getProfileByUsername(req, res, next) {
  try {
    const user = await User.findOne({ username: req.params.username }).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    res.json({ user });
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const { username, bio, email, password } = req.body;
    const user = req.user;

    if (username && username.trim() !== user.username) {
      const exists = await User.findOne({ username: username.trim() });
      if (exists) {
        return res.status(409).json({ message: "Username already taken." });
      }
      user.username = username.trim();
    }

    if (email && email.trim().toLowerCase() !== user.email) {
      const exists = await User.findOne({ email: email.trim().toLowerCase() });
      if (exists) {
        return res.status(409).json({ message: "Email already taken." });
      }
      user.email = email.trim().toLowerCase();
    }

    if (typeof bio === "string") {
      user.bio = bio;
    }

    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    if (req.file) {
      user.profileImage = `/uploads/${req.file.filename}`;
    }

    await user.save();
    const hydrated = await User.findById(user._id).populate([
      { path: "friends", select: "username profileImage" },
      { path: "sentRequests", select: "username profileImage" },
      { path: "receivedRequests", select: "username profileImage" }
    ]);
    res.json({ user: toUserView(hydrated) });
  } catch (error) {
    next(error);
  }
}
