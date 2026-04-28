import React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useDialog } from "../context/DialogContext";

export default function SearchPage() {
  const { user, refreshMe } = useAuth();
  const { showError } = useDialog();
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");

  async function onSearch(event) {
    event.preventDefault();
    try {
      const { data } = await api.get(`/users/search?q=${encodeURIComponent(query)}`);
      setUsers(data.users);
    } catch (err) {
      showError(err.response?.data?.message || "Search failed.");
    }
  }

  async function sendRequest(userId) {
    try {
      setMessage("");
      await api.post(`/request/send/${userId}`);
      setMessage("Friend request sent.");
      await refreshMe();
      setUsers((prev) => prev.filter((x) => x._id !== userId));
    } catch (err) {
      showError(err.response?.data?.message || "Failed to send request.");
    }
  }

  const friendIds = new Set((user?.friends || []).map((x) => x.id));
  const sentIds = new Set((user?.sentRequests || []).map((x) => x.id));
  const receivedIds = new Set((user?.receivedRequests || []).map((x) => x.id));

  function getRelationLabel(userId) {
    if (friendIds.has(userId)) {
      return "Friend";
    }
    if (sentIds.has(userId)) {
      return "Requested";
    }
    if (receivedIds.has(userId)) {
      return "Request received";
    }
    return "";
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
      <ul className="list">
        {users.map((person) => (
          <li key={person._id} className="card-row">
            <Link to={`/users/${person.username}`} className="mini-avatar-link">
              {person.profileImage ? (
                <img src={`http://localhost:5050${person.profileImage}`} alt={person.username} className="avatar" />
              ) : (
                <span className="friend-avatar">{(person.username || "U").slice(0, 1)}</span>
              )}
            </Link>
            <div className="friend-meta">
              <strong>{person.username}</strong>
              <small>{person.bio || "No bio yet"}</small>
            </div>
            {!friendIds.has(person._id) && !sentIds.has(person._id) && !receivedIds.has(person._id) ? (
              <button type="button" onClick={() => sendRequest(person._id)}>
                Send request
              </button>
            ) : (
              <span className="status-pill done">{getRelationLabel(person._id)}</span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
