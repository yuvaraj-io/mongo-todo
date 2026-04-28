import React from "react";
import { formatTime } from "./chatUtils";

export default function MessageBubble({ message, mine }) {
  return (
    <li className={`bubble ${mine ? "mine" : "theirs"}`}>
      <p>{message.content}</p>
      <small>{formatTime(message.createdAt)}</small>
    </li>
  );
}

