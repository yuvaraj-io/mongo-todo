import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import ChatHeader from "../components/chat/ChatHeader";
import MessageBubble from "../components/chat/MessageBubble";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useDialog } from "../context/DialogContext";
import { useNotifications } from "../context/NotificationContext";

export default function ChatConversationPage() {
  const { friendId } = useParams();
  const { user } = useAuth();
  const { refreshNotifications, subscribeToMessages, sendChatMessage } = useNotifications();
  const { showError } = useDialog();
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const messagesEndRef = useRef(null);

  const friend = useMemo(
    () => (user?.friends || []).find((item) => item.id === friendId),
    [user?.friends, friendId]
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!friendId) {
      return;
    }

    async function loadConversation() {
      try {
        await api.patch(`/messages/read/${friendId}`);
        const { data } = await api.get(`/messages/${friendId}`);
        setMessages(data.messages || []);
        refreshNotifications().catch(() => {});
      } catch (err) {
        showError(err.response?.data?.message || "Could not load conversation.");
      }
    }

    loadConversation().catch(() => {});
  }, [friendId, refreshNotifications, showError]);

  useEffect(() => {
    if (!friendId) {
      return undefined;
    }

    const unsubscribe = subscribeToMessages((message) => {
      const sender = message.senderId?._id || message.senderId;
      const receiver = message.receiverId?._id || message.receiverId;
      const related = sender === friendId || receiver === friendId;
      if (!related) {
        return;
      }
      setMessages((prev) => [...prev, message]);
      if (sender === friendId) {
        api.patch(`/messages/read/${friendId}`).catch(() => {});
      }
    });

    return unsubscribe;
  }, [friendId, refreshNotifications, subscribeToMessages]);

  async function sendMessage(event) {
    event.preventDefault();
    if (!friendId || !content.trim()) {
      return;
    }
    try {
      sendChatMessage({ receiverId: friendId, content });
      setContent("");
    } catch (err) {
      showError(err.response?.data?.message || "Could not send message.");
    }
  }

  return (
    <section className="page">
      <ChatHeader
        title={friend?.username || "Conversation"}
        username={friend?.username}
        profileImage={friend?.profileImage}
      />
      <div className="chat-panel single-chat-panel">
        <ul className="messages chat-messages">
          {messages.map((message) => (
            <MessageBubble
              key={message._id || `${message.senderId}-${message.createdAt}`}
              message={message}
              mine={(message.senderId?._id || message.senderId) === user?.id}
            />
          ))}
          <li ref={messagesEndRef} />
        </ul>
        <form className="row-form chat-input-row" onSubmit={sendMessage}>
          <textarea
            className="chat-message-input"
            value={content}
            placeholder="Type your message..."
            onChange={(event) => setContent(event.target.value)}
            rows={3}
          />
          <button type="submit" disabled={!content.trim()}>
            Send
          </button>
        </form>
      </div>
    </section>
  );
}
