
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, setAuthToken } from "../api/client";

const AuthContext = createContext(null);

const STORAGE_KEY = "todo_auth";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEY) || "");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshMe = useCallback(async () => {
    const { data } = await api.get("/auth/me");
    setUser(data.user);
    return data.user;
  }, []);

  useEffect(() => {
    if (token) {
      localStorage.setItem(STORAGE_KEY, token);
      setAuthToken(token);
      refreshMe().finally(() => setLoading(false));
    } else {
      localStorage.removeItem(STORAGE_KEY);
      setAuthToken("");
      setUser(null);
      setLoading(false);
    }
  }, [token, refreshMe]);

  const login = useCallback(async (payload) => {
    const { data } = await api.post("/auth/login", payload);
    setToken(data.token);
    setUser(data.user);
  }, []);

  const register = useCallback(async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    setToken(data.token);
    setUser(data.user);
  }, []);

  const logout = useCallback(() => {
    setToken("");
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      setUser,
      login,
      register,
      logout,
      refreshMe
    }),
    [token, user, loading, login, register, logout, refreshMe]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
