import React from "react";
import { formatBadgeCount, formatTime } from "./chatUtils";

export default function FriendListItem({
  friend,
  unreadCount,
  active,
  lastMessage,
  onClick
}) {
  return (
    <button type="button" className={`friend-row ${active ? "active" : ""}`} onClick={onClick}>
      <span className="friend-avatar">{(friend.username || "U").slice(0, 1)}</span>
      <span className="friend-meta">
        <strong>{friend.username || friend.id}</strong>
        <small className="friend-preview">{lastMessage?.content || "Start a conversation"}</small>
      </span>
      <span className="friend-side">
        <small className="friend-time">{formatTime(lastMessage?.createdAt)}</small>
        {unreadCount > 0 ? <span className="badge badge-chat">{formatBadgeCount(unreadCount)}</span> : null}
      </span>
    </button>
  );
}

