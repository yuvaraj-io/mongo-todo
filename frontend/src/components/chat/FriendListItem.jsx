import React from "react";
import { Link } from "react-router-dom";
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
      <Link
        to={`/users/${friend.username}`}
        className="mini-avatar-link"
        onClick={(event) => event.stopPropagation()}
      >
        {friend.profileImage ? (
          <img src={`http://localhost:5050${friend.profileImage}`} alt={friend.username} className="avatar" />
        ) : (
          <span className="friend-avatar">{(friend.username || "U").slice(0, 1)}</span>
        )}
      </Link>
      <span className="friend-meta">
        <strong>{friend.username || friend.id}</strong>
        <small className="friend-preview">
          {unreadCount > 0
            ? `${formatBadgeCount(unreadCount)} pending message${
                unreadCount > 1 ? "s" : ""
              }`
            : lastMessage?.content || "No pending messages"}
        </small>
      </span>
      <span className="friend-side">
        <small className="friend-time">{formatTime(lastMessage?.createdAt)}</small>
        {unreadCount > 0 ? <span className="badge badge-chat">{formatBadgeCount(unreadCount)}</span> : null}
      </span>
    </button>
  );
}
