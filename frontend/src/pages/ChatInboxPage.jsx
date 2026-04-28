import React, { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import FriendListItem from "../components/chat/FriendListItem";
import { getFriendIdFromMessage } from "../components/chat/chatUtils";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useDialog } from "../context/DialogContext";
import { useNotifications } from "../context/NotificationContext";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5050";

export default function ChatInboxPage() {
  const { token, user } = useAuth();
  const { showError } = useDialog();
  const { unreadByUser, refreshNotifications } = useNotifications();
  const [lastByFriend, setLastByFriend] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    if (!token || !user?.id) {
      return undefined;
    }

    const socket = io(SERVER_URL, { auth: { token } });
    socket.on("chat:message", (message) => {
      refreshNotifications().catch(() => {});
      const friendId = getFriendIdFromMessage(message, user.id);
      if (!friendId) {
        return;
      }
      setLastByFriend((prev) => ({ ...prev, [friendId]: message }));
    });
    return () => socket.disconnect();
  }, [token, user?.id, refreshNotifications]);

  useEffect(() => {
    async function loadLastMessages() {
      const friends = user?.friends || [];
      const entries = await Promise.all(
        friends.map(async (friend) => {
          try {
            const { data } = await api.get(`/messages/${friend.id}`);
            const messages = data.messages || [];
            return [friend.id, messages[messages.length - 1] || null];
          } catch (_error) {
            return [friend.id, null];
          }
        })
      );
      setLastByFriend(Object.fromEntries(entries));
    }
    loadLastMessages().catch((err) => {
      showError(err.response?.data?.message || "Could not load inbox previews.");
    });
  }, [user?.friends, showError]);

  const friends = useMemo(() => {
    const list = [...(user?.friends || [])];
    list.sort((a, b) => (unreadByUser[b.id] || 0) - (unreadByUser[a.id] || 0));
    return list;
  }, [user?.friends, unreadByUser]);

  const totalPending = useMemo(
    () => Object.values(unreadByUser || {}).reduce((sum, count) => sum + count, 0),
    [unreadByUser]
  );

  return (
    <section className="page">
      <div className="page-header">
        <h1>Pending Messages</h1>
        <p className="muted">
          {totalPending > 0
            ? `${totalPending} total pending across friends`
            : "No pending messages right now."}
        </p>
      </div>
      <div className="chat-inbox">
        {friends.length === 0 ? (
          <div className="empty-card">
            <h3>No friends yet</h3>
            <p>Accept friend requests first, then your inbox appears here.</p>
          </div>
        ) : (
          friends.map((friend) => (
            <FriendListItem
              key={friend.id}
              friend={friend}
              unreadCount={unreadByUser[friend.id] || 0}
              lastMessage={lastByFriend[friend.id]}
              active={false}
              onClick={() => navigate(`/chat/${friend.id}`)}
            />
          ))
        )}
      </div>
    </section>
  );
}
