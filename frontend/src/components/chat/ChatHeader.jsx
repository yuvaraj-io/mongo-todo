import React from "react";
import { Link } from "react-router-dom";

export default function ChatHeader({ title }) {
  return (
    <div className="chat-header">
      <Link to="/chat" className="back-link">
        ← Back
      </Link>
      <span className="chat-header-user">{title}</span>
    </div>
  );
}

