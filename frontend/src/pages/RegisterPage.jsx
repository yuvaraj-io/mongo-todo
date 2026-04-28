import React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");

  async function onSubmit(event) {
    event.preventDefault();
    try {
      setError("");
      await register(form);
      navigate("/todos");
    } catch (err) {
      setError(err.response?.data?.message || "Register failed.");
    }
  }

  return (
    <section className="auth-shell">
      <form className="auth-card" onSubmit={onSubmit}>
        <h1>Register</h1>
        <input
          placeholder="Username"
          value={form.username}
          onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
        />
        <input
          placeholder="Email"
          value={form.email}
          onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
        />
        {error && <p className="error">{error}</p>}
        <button type="submit">Register</button>
        <p>
          Already have account? <Link to="/login">Login</Link>
        </p>
      </form>
    </section>
  );
}

