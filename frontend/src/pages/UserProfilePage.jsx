import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useDialog } from "../context/DialogContext";

export default function UserProfilePage() {
  const { username } = useParams();
  const { user, refreshMe } = useAuth();
  const { showError } = useDialog();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [todos, setTodos] = useState([]);
  const [todosLocked, setTodosLocked] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const { data } = await api.get(`/profile/${username}`);
        setProfile(data.user);
      } catch (err) {
        showError(err.response?.data?.message || "Could not load profile.");
      }
    }
    load().catch(() => {});
  }, [username, showError]);

  useEffect(() => {
    async function loadTodos() {
      try {
        const { data } = await api.get(`/todos/${username}`);
        setTodos(data.todos || []);
        setTodosLocked(false);
      } catch (_error) {
        setTodos([]);
        setTodosLocked(true);
      }
    }
    loadTodos().catch(() => {});
  }, [username]);

  const isSelf = useMemo(() => profile?.username === user?.username, [profile, user?.username]);
  const friendIds = useMemo(() => new Set((user?.friends || []).map((x) => x.id)), [user?.friends]);
  const sentIds = useMemo(() => new Set((user?.sentRequests || []).map((x) => x.id)), [user?.sentRequests]);
  const receivedIds = useMemo(
    () => new Set((user?.receivedRequests || []).map((x) => x.id)),
    [user?.receivedRequests]
  );
  const profileId = profile?._id || profile?.id;
  const isFriend = profileId ? friendIds.has(profileId) : false;

  async function sendRequest() {
    if (!profileId) {
      return;
    }
    try {
      await api.post(`/request/send/${profileId}`);
      await refreshMe();
    } catch (err) {
      showError(err.response?.data?.message || "Could not send request.");
    }
  }

  function openChat() {
    if (!profileId) {
      return;
    }
    const found = (user?.friends || []).find((x) => x.id === profileId || x.username === profile?.username);
    if (found) {
      navigate(`/chat/${found.id}`);
    }
  }

  return (
    <section className="page">
      <div className="profile-header-card">
        {profile?.profileImage ? (
          <img src={`http://localhost:5050${profile.profileImage}`} alt="profile" className="profile-hero-avatar" />
        ) : (
          <div className="profile-hero-avatar avatar-fallback">{(profile?.username || "U").slice(0, 1)}</div>
        )}
        <div>
          <h1>@{profile?.username || username}</h1>
          <p className="muted">{profile?.bio || "No bio yet."}</p>
          <div className="profile-action-row">
            {!isSelf && !isFriend && !sentIds.has(profileId) && !receivedIds.has(profileId) ? (
              <button type="button" onClick={sendRequest}>
                Send request
              </button>
            ) : null}
            {!isSelf && isFriend ? (
              <button type="button" onClick={openChat}>
                Message
              </button>
            ) : null}
            <Link to="/search">Back to search</Link>
          </div>
        </div>
      </div>

      <div className="shared-card">
        <h2>{profile?.username || username} Todos</h2>
        {todosLocked ? <p className="muted">Only friends can view these todos.</p> : null}
        <ul className="list">
          {todos.map((todo) => (
            <li key={todo._id} className="shared-item">
              <span>{todo.title}</span>
              <span className={`status-pill ${todo.completed ? "done" : "pending"}`}>
                {todo.completed ? "Done" : "Pending"}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

