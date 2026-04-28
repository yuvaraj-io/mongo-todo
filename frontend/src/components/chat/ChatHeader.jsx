import React from "react";
import { Link } from "react-router-dom";

export default function ChatHeader({ title, username, profileImage }) {
  return (
    <div className="chat-header">
      <Link to="/chat" className="back-link">
        ← Back
      </Link>
      <Link to={`/users/${username}`} className="chat-header-user-link">
        {profileImage ? (
          <img src={`http://localhost:5050${profileImage}`} alt={username} className="avatar" />
        ) : (
          <span className="friend-avatar">{(username || "U").slice(0, 1)}</span>
        )}
        <span className="chat-header-user">{title}</span>
      </Link>
    </div>
  );
}
