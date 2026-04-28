import React from "react";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5050";

function formatBadgeCount(value) {
  if (!value || value <= 0) {
    return "";
  }
  if (value > 99) {
    return "99+";
  }
  return String(value);
}

function formatTime(value) {
  if (!value) {
    return "";
  }
  return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function ChatPage() {
  const { token, user } = useAuth();
  const { unreadByUser, refreshNotifications } = useNotifications();
  const [selectedFriend, setSelectedFriend] = useState("");
  const [selectedFriendName, setSelectedFriendName] = useState("");
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const socketRef = useRef(null);
  const selectedFriendRef = useRef("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    selectedFriendRef.current = selectedFriend;
  }, [selectedFriend]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!token) {
      return undefined;
    }

    const socket = io(SERVER_URL, {
      auth: { token }
    });
    socketRef.current = socket;

    socket.on("chat:message", (message) => {
      refreshNotifications().catch(() => {});
      const friendId = selectedFriendRef.current;
      const related =
        message.senderId === friendId ||
        message.receiverId === friendId ||
        message.senderId?._id === friendId ||
        message.receiverId?._id === friendId;

      if (related) {
        setMessages((prev) => [...prev, message]);
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, refreshNotifications]);

  async function loadHistory(friendId, friendUsername) {
    setSelectedFriend(friendId);
    setSelectedFriendName(friendUsername || "Friend");
    await api.patch(`/messages/read/${friendId}`);
    const { data } = await api.get(`/messages/${friendId}`);
    setMessages(data.messages);
    refreshNotifications().catch(() => {});
  }

  async function sendMessage(event) {
    event.preventDefault();
    if (!selectedFriend || !content.trim()) {
      return;
    }

    socketRef.current?.emit("chat:send", { receiverId: selectedFriend, content });
    setContent("");
  }

  return (
    <section className="page">
      <div className="page-header">
        <h1>Messages</h1>
        <p className="muted">Chat with accepted friends only.</p>
      </div>
      <div className="chat-layout">
        <aside className="chat-friends">
          {(user?.friends || []).map((friend) => (
            <button
              key={friend.id}
              type="button"
              className={`friend-row ${selectedFriend === friend.id ? "active" : ""}`}
              onClick={() => loadHistory(friend.id, friend.username)}
            >
              <span className="friend-avatar">{(friend.username || "U").slice(0, 1)}</span>
              <span className="friend-meta">
                <strong>{friend.username || friend.id}</strong>
                <small>
                  {(unreadByUser[friend.id] || 0) > 0
                    ? "New messages waiting"
                    : "Tap to open conversation"}
                </small>
              </span>
              {(unreadByUser[friend.id] || 0) > 0 ? (
                <span className="badge badge-chat">{formatBadgeCount(unreadByUser[friend.id])}</span>
              ) : null}
            </button>
          ))}
        </aside>
        <div className="chat-panel">
          <div className="chat-header">
            <span>{selectedFriend ? selectedFriendName : "Select a friend"}</span>
          </div>
          <ul className="messages chat-messages">
            {messages.map((message) => (
              <li
                key={message._id || `${message.senderId}-${message.createdAt}`}
                className={`bubble ${
                  (message.senderId?._id || message.senderId) === user?.id ? "mine" : "theirs"
                }`}
              >
                <p>{message.content}</p>
                <small>{formatTime(message.createdAt)}</small>
              </li>
            ))}
            <li ref={messagesEndRef} />
          </ul>
          <form className="row-form chat-input-row" onSubmit={sendMessage}>
            <input
              value={content}
              placeholder={selectedFriend ? "Type a message..." : "Select a friend to start"}
              onChange={(event) => setContent(event.target.value)}
              disabled={!selectedFriend}
            />
            <button type="submit" disabled={!selectedFriend || !content.trim()}>
              Send
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
