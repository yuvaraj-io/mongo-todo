import React from "react";
import { useState } from "react";
import { api } from "../api/client";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function onSearch(event) {
    event.preventDefault();
    try {
      setError("");
      const { data } = await api.get(`/users/search?q=${encodeURIComponent(query)}`);
      setUsers(data.users);
    } catch (err) {
      setError(err.response?.data?.message || "Search failed.");
    }
  }

  async function sendRequest(userId) {
    try {
      setMessage("");
      await api.post(`/request/send/${userId}`);
      setMessage("Friend request sent.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send request.");
    }
  }

  return (
    <section className="page">
      <h1>User Search</h1>
      <form onSubmit={onSearch} className="row-form">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search username"
        />
        <button type="submit">Search</button>
      </form>
      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}
      <ul className="list">
        {users.map((user) => (
          <li key={user._id} className="card-row">
            <span>{user.username}</span>
            <button type="button" onClick={() => sendRequest(user._id)}>
              Send request
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

