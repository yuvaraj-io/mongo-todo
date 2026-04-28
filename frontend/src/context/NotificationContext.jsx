import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { token } = useAuth();
  const [requestCount, setRequestCount] = useState(0);
  const [unreadByUser, setUnreadByUser] = useState({});
  const [totalUnreadMessages, setTotalUnreadMessages] = useState(0);

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

  const value = useMemo(
    () => ({
      requestCount,
      unreadByUser,
      totalUnreadMessages,
      refreshNotifications
    }),
    [requestCount, unreadByUser, totalUnreadMessages]
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
