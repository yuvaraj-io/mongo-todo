export function formatBadgeCount(value) {
  if (!value || value <= 0) {
    return "";
  }
  if (value > 99) {
    return "99+";
  }
  return String(value);
}

export function formatTime(value) {
  if (!value) {
    return "";
  }
  return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function getFriendIdFromMessage(message, currentUserId) {
  const sender = message.senderId?._id || message.senderId;
  const receiver = message.receiverId?._id || message.receiverId;
  return sender === currentUserId ? receiver : sender;
}

