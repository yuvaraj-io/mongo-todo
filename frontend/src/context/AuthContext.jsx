
import React, { createContext, useContext, useEffect, useState } from "react";
import { api, setAuthToken } from "../api/client";

const AuthContext = createContext(null);

const STORAGE_KEY = "todo_auth";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEY) || "");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
  }, [token]);

  async function refreshMe() {
    const { data } = await api.get("/auth/me");
    setUser(data.user);
    return data.user;
  }

  async function login(payload) {
    const { data } = await api.post("/auth/login", payload);
    setToken(data.token);
    setUser(data.user);
  }

  async function register(payload) {
    const { data } = await api.post("/auth/register", payload);
    setToken(data.token);
    setUser(data.user);
  }

  function logout() {
    setToken("");
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        setUser,
        login,
        register,
        logout,
        refreshMe
      }}
    >
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

