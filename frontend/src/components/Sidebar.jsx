import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";


export default function Sidebar() {
  const { user, logout } = useAuth();
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
        <NavLink to="/todos">Todos</NavLink>
        <NavLink to="/profile">Profile</NavLink>
        <NavLink to="/search">Search</NavLink>
        <NavLink to="/requests">Requests</NavLink>
        <NavLink to="/chat">Chat</NavLink>
      </nav>

      <button className="danger-button" type="button" onClick={onLogout}>
        Logout
      </button>
    </aside>
  );
}

