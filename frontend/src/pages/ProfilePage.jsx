import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useDialog } from "../context/DialogContext";

export default function ProfilePage() {
  const { user, setUser, logout } = useAuth();
  const { showError } = useDialog();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: user?.username || "",
    email: user?.email || "",
    bio: user?.bio || "",
    password: ""
  });
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  async function onSubmit(event) {
    event.preventDefault();
    try {
      const data = new FormData();
      data.append("username", form.username);
      data.append("email", form.email);
      data.append("bio", form.bio);
      if (form.password) {
        data.append("password", form.password);
      }
      if (file) {
        data.append("profileImage", file);
      }
      const response = await api.put("/profile/update", data);
      setUser(response.data.user);
      setMessage("Profile updated.");
      setForm((prev) => ({ ...prev, password: "" }));
    } catch (err) {
      showError(err.response?.data?.message || "Profile update failed.");
    }
  }

  function onLogout() {
    logout();
    navigate("/login");
  }

  return (
    <section className="page">
      <div className="page-header">
        <h1>Profile</h1>
        <p className="muted">Manage your identity and account settings.</p>
      </div>
      <div className="profile-header-card">
        {user?.profileImage ? (
          <img src={`http://localhost:5050${user.profileImage}`} alt={user.username} className="profile-hero-avatar" />
        ) : (
          <div className="profile-hero-avatar avatar-fallback">{(user?.username || "U").slice(0, 1)}</div>
        )}
        <div>
          <h2>@{user?.username}</h2>
          <p className="muted">{user?.email}</p>
          <p className="muted">{user?.bio || "No bio yet."}</p>
        </div>
      </div>
      <form className="stack-form" onSubmit={onSubmit}>
        <input
          placeholder="Username"
          value={form.username}
          onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
        />
        <input
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
        />
        <textarea
          placeholder="Bio"
          value={form.bio}
          onChange={(e) => setForm((prev) => ({ ...prev, bio: e.target.value }))}
        />
        <input
          type="password"
          placeholder="New password (optional)"
          value={form.password}
          onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
        />
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        {message && <p className="success">{message}</p>}
        <div className="profile-action-row">
          <button type="submit">Update profile</button>
          <button type="button" className="danger-button" onClick={onLogout}>
            Logout
          </button>
        </div>
      </form>
    </section>
  );
}
