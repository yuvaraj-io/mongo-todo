import React from "react";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5050";

export default function ChatPage() {
  const { token, user } = useAuth();
  const [selectedFriend, setSelectedFriend] = useState("");
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const socketRef = useRef(null);
  const selectedFriendRef = useRef("");

  useEffect(() => {
    selectedFriendRef.current = selectedFriend;
  }, [selectedFriend]);

  useEffect(() => {
    if (!token) {
      return undefined;
    }

    const socket = io(SERVER_URL, {
      auth: { token }
    });
    socketRef.current = socket;

    socket.on("chat:message", (message) => {
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
  }, [token]);

  async function loadHistory(friendId) {
    setSelectedFriend(friendId);
    const { data } = await api.get(`/messages/${friendId}`);
    setMessages(data.messages);
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
      <h1>Chat</h1>
      <div className="chat-layout">
        <aside className="chat-friends">
          {(user?.friends || []).map((friend) => (
            <button
              key={friend.id}
              type="button"
              className={selectedFriend === friend.id ? "active" : ""}
              onClick={() => loadHistory(friend.id)}
            >
              {friend.username || friend.id}
            </button>
          ))}
        </aside>
        <div className="chat-panel">
          <ul className="messages">
            {messages.map((message) => (
              <li key={message._id || `${message.senderId}-${message.createdAt}`}>
                <strong>
                  {(message.senderId?._id || message.senderId) === user?.id ? "You" : "Friend"}:
                </strong>{" "}
                {message.content}
              </li>
            ))}
          </ul>
          <form className="row-form" onSubmit={sendMessage}>
            <input
              value={content}
              placeholder="Type message"
              onChange={(event) => setContent(event.target.value)}
            />
            <button type="submit">Send</button>
          </form>
        </div>
      </div>
    </section>
  );
}
