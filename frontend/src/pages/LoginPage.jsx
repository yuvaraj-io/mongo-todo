import React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  async function onSubmit(event) {
    event.preventDefault();
    try {
      setError("");
      await login(form);
      navigate("/todos");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed.");
    }
  }

  return (
    <section className="auth-shell">
      <form className="auth-card" onSubmit={onSubmit}>
        <h1>Login</h1>
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
        <button type="submit">Login</button>
        <p>
          No account? <Link to="/register">Register</Link>
        </p>
      </form>
    </section>
  );
}

