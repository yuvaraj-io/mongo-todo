import React from "react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useDialog } from "../context/DialogContext";
import { useNotifications } from "../context/NotificationContext";

export default function RequestsPage() {
  const { user, refreshMe } = useAuth();
  const { refreshNotifications } = useNotifications();
  const { showError } = useDialog();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRequests() {
      try {
        await refreshMe();
        await refreshNotifications();
      } catch (err) {
        showError(err.response?.data?.message || "Could not load friend requests.");
      } finally {
        setLoading(false);
      }
    }
    loadRequests().catch(() => {
      setLoading(false);
    });
  }, [refreshMe, refreshNotifications, showError]);

  async function accept(userId) {
    try {
      await api.post(`/request/accept/${userId}`);
      await refreshMe();
      await refreshNotifications();
    } catch (err) {
      showError(err.response?.data?.message || "Failed to accept request.");
    }
  }

  async function reject(userId) {
    try {
      await api.post(`/request/reject/${userId}`);
      await refreshMe();
      await refreshNotifications();
    } catch (err) {
      showError(err.response?.data?.message || "Failed to reject request.");
    }
  }

  const requests = (user?.receivedRequests || []).map((requester) => ({
    id: requester.id || requester._id,
    username: requester.username || requester.id || requester._id,
    profileImage: requester.profileImage || ""
  }));

  return (
    <section className="page">
      <h1>Friend Requests</h1>
      {loading ? <p className="muted">Loading requests...</p> : null}
      {!loading && requests.length === 0 ? (
        <div className="empty-card">
          <h3>No pending requests</h3>
          <p>When someone sends a request, it appears here.</p>
        </div>
      ) : null}
      <ul className="list">
        {requests.map((requester) => (
          <li key={requester.id} className="card-row">
            <Link to={`/users/${requester.username}`} className="mini-avatar-link">
              {requester.profileImage ? (
                <img
                  src={`http://localhost:5050${requester.profileImage}`}
                  alt={requester.username}
                  className="avatar"
                />
              ) : (
                <span className="friend-avatar">{(requester.username || "U").slice(0, 1)}</span>
              )}
            </Link>
            <Link to={`/users/${requester.username}`} className="requester-link">
              {requester.username}
            </Link>
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
