import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { signToken } from "../utils/token.js";
import { toUserView } from "../utils/userView.js";

async function hydrateUser(userId) {
  return User.findById(userId).populate([
    { path: "friends", select: "username profileImage" },
    { path: "sentRequests", select: "username profileImage" },
    { path: "receivedRequests", select: "username profileImage" }
  ]);
}

export async function register(req, res, next) {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "username, email and password are required." });
    }

    const existing = await User.findOne({
      $or: [{ username: username.trim() }, { email: email.trim().toLowerCase() }]
    });
    if (existing) {
      return res.status(409).json({ message: "Username or email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword
    });

    const hydrated = await hydrateUser(user._id);
    const token = signToken(user._id.toString());
    res.status(201).json({ token, user: toUserView(hydrated) });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required." });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const hydrated = await hydrateUser(user._id);
    const token = signToken(user._id.toString());
    res.json({ token, user: toUserView(hydrated) });
  } catch (error) {
    next(error);
  }
}

export async function me(req, res, next) {
  try {
    const hydrated = await hydrateUser(req.user._id);
    res.json({ user: toUserView(hydrated) });
  } catch (error) {
    next(error);
  }
}
