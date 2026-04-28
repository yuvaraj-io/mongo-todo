import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import ChatPage from "./pages/ChatPage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import RegisterPage from "./pages/RegisterPage";
import RequestsPage from "./pages/RequestsPage";
import SearchPage from "./pages/SearchPage";
import TodosPage from "./pages/TodosPage";

function ProtectedPage({ children }) {
  return (
    <ProtectedRoute>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/todos"
            element={
              <ProtectedPage>
                <TodosPage />
              </ProtectedPage>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedPage>
                <ProfilePage />
              </ProtectedPage>
            }
          />
          <Route
            path="/search"
            element={
              <ProtectedPage>
                <SearchPage />
              </ProtectedPage>
            }
          />
          <Route
            path="/requests"
            element={
              <ProtectedPage>
                <RequestsPage />
              </ProtectedPage>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedPage>
                <ChatPage />
              </ProtectedPage>
            }
          />
          <Route path="/" element={<Navigate to="/todos" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

