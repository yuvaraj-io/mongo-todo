import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";

function formatBadgeCount(value) {
  if (!value || value <= 0) {
    return "";
  }
  if (value > 99) {
    return "99+";
  }
  return String(value);
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { requestCount, totalUnreadMessages } = useNotifications();
  const navigate = useNavigate();

  function onLogout() {
    logout();
    navigate("/login");
  }

  return (
    <aside className="sidebar">
      <Link className="brand" to="/todos">
        MERN Todo
      </Link>
      <div className="profile-mini">
        {user?.profileImage ? (
          <img src={`http://localhost:5050${user.profileImage}`} alt="profile" className="avatar" />
        ) : (
          <div className="avatar avatar-fallback">{user?.username?.slice(0, 1) || "U"}</div>
        )}
        <div>
          <p className="username">{user?.username}</p>
          <p className="email">{user?.email}</p>
        </div>
      </div>

      <nav className="nav-links">
        <NavLink to="/todos">
          <span className="nav-item">🏠<small>Home</small></span>
        </NavLink>
        <NavLink to="/search">
          <span className="nav-item">🔎<small>Search</small></span>
        </NavLink>
        <NavLink to="/requests" className="with-badge">
          <span className="nav-item">🔔<small>Alerts</small></span>
          {requestCount > 0 ? (
            <span className="badge badge-alert">{formatBadgeCount(requestCount)}</span>
          ) : null}
        </NavLink>
        <NavLink to="/chat" className="with-badge">
          <span className="nav-item">💬<small>Chat</small></span>
          {totalUnreadMessages > 0 ? (
            <span className="badge badge-chat">{formatBadgeCount(totalUnreadMessages)}</span>
          ) : null}
        </NavLink>
        <NavLink to="/profile">
          <span className="nav-item">👤<small>Profile</small></span>
        </NavLink>
      </nav>

      <button className="danger-button" type="button" onClick={onLogout}>
        Logout
      </button>
    </aside>
  );
}
