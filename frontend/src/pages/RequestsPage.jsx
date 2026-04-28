import React from "react";
import { useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";

export default function RequestsPage() {
  const { user, refreshMe } = useAuth();
  const { refreshNotifications } = useNotifications();
  const [error, setError] = useState("");

  async function accept(userId) {
    try {
      setError("");
      await api.post(`/request/accept/${userId}`);
      await refreshMe();
      await refreshNotifications();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to accept request.");
    }
  }

  async function reject(userId) {
    try {
      setError("");
      await api.post(`/request/reject/${userId}`);
      await refreshMe();
      await refreshNotifications();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reject request.");
    }
  }

  return (
    <section className="page">
      <h1>Friend Requests</h1>
      {error && <p className="error">{error}</p>}
      <ul className="list">
        {(user?.receivedRequests || []).map((requester) => (
          <li key={requester.id} className="card-row">
            <span>{requester.username || requester.id}</span>
            <div className="button-row">
              <button type="button" onClick={() => accept(requester.id)}>
                Accept
              </button>
              <button type="button" className="danger-button" onClick={() => reject(requester.id)}>
                Reject
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
