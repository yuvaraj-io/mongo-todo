import jwt from "jsonwebtoken";

export function signToken(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET || "change_me", {
    expiresIn: "7d"
  });
}

