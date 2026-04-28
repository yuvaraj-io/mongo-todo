import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import { api } from "../api/client";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext(null);
const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5050";

export function NotificationProvider({ children }) {
  const { token, user } = useAuth();
  const [requestCount, setRequestCount] = useState(0);
  const [unreadByUser, setUnreadByUser] = useState({});
  const [totalUnreadMessages, setTotalUnreadMessages] = useState(0);
  const [notificationPermission, setNotificationPermission] = useState(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return "unsupported";
    }
    return Notification.permission;
  });
  const socketRef = useRef(null);
  const messageListenersRef = useRef(new Set());
  const userRef = useRef(user);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const refreshNotifications = useCallback(async () => {
    if (!token) {
      setRequestCount(0);
      setUnreadByUser({});
      setTotalUnreadMessages(0);
      return;
    }

    const [meResponse, unreadResponse] = await Promise.all([
      api.get("/auth/me"),
      api.get("/messages/unread-summary")
    ]);

    setRequestCount((meResponse.data.user?.receivedRequests || []).length);
    setUnreadByUser(unreadResponse.data.byUser || {});
    setTotalUnreadMessages(unreadResponse.data.total || 0);
  }, [token]);

  useEffect(() => {
    refreshNotifications().catch(() => {});
    if (!token) {
      return undefined;
    }
    const timer = setInterval(() => {
      refreshNotifications().catch(() => {});
    }, 10000);
    return () => clearInterval(timer);
  }, [token, refreshNotifications]);

  const requestBrowserNotifications = useCallback(async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setNotificationPermission("unsupported");
      return "unsupported";
    }
    const result = await Notification.requestPermission();
    setNotificationPermission(result);
    return result;
  }, []);

  const subscribeToMessages = useCallback((handler) => {
    messageListenersRef.current.add(handler);
    return () => {
      messageListenersRef.current.delete(handler);
    };
  }, []);

  const sendChatMessage = useCallback((payload) => {
    socketRef.current?.emit("chat:send", payload);
  }, []);

  useEffect(() => {
    if (!token || !user?.id) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return undefined;
    }

    const socket = io(SERVER_URL, { auth: { token } });
    socketRef.current = socket;

    socket.on("chat:message", (message) => {
      messageListenersRef.current.forEach((handler) => {
        try {
          handler(message);
        } catch (_error) {
        }
      });

      const receiverId = message.receiverId?._id || message.receiverId;
      const senderId = message.senderId?._id || message.senderId;

      if (receiverId !== user.id || senderId === user.id) {
        return;
      }

      const currentUser = userRef.current;
      const sender = (currentUser?.friends || []).find((friend) => friend.id === senderId);
      const senderName = sender?.username || "New message";
      refreshNotifications().catch(() => {});

      if (
        typeof window !== "undefined" &&
        "Notification" in window &&
        notificationPermission === "granted"
      ) {
        const notification = new Notification(`Message from ${senderName}`, {
          body: message.content || "You have a new message",
          icon: sender?.profileImage ? `http://localhost:5050${sender.profileImage}` : undefined
        });

        notification.onclick = () => {
          window.focus();
          window.location.assign(`/chat/${senderId}`);
        };
      }
    });

    return () => {
      socket.disconnect();
      if (socketRef.current === socket) {
        socketRef.current = null;
      }
    };
  }, [token, user?.id, refreshNotifications, notificationPermission]);

  const value = useMemo(
    () => ({
      requestCount,
      unreadByUser,
      totalUnreadMessages,
      refreshNotifications,
      notificationPermission,
      requestBrowserNotifications,
      subscribeToMessages,
      sendChatMessage
    }),
    [
      requestCount,
      unreadByUser,
      totalUnreadMessages,
      notificationPermission,
      requestBrowserNotifications,
      refreshNotifications,
      subscribeToMessages,
      sendChatMessage
    ]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used inside NotificationProvider");
  }
  return context;
}
