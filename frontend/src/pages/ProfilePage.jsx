import React from "react";
import { useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    username: user?.username || "",
    email: user?.email || "",
    bio: user?.bio || "",
    password: ""
  });
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(event) {
    event.preventDefault();
    try {
      setError("");
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
      setError(err.response?.data?.message || "Profile update failed.");
    }
  }

  return (
    <section className="page">
      <h1>Profile</h1>
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
        {error && <p className="error">{error}</p>}
        <button type="submit">Update profile</button>
      </form>
    </section>
  );
}

