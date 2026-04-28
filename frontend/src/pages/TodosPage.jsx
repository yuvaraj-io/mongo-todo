import React from "react";
import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function TodosPage() {
  const { user } = useAuth();
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [sharedUsername, setSharedUsername] = useState("");
  const [sharedTodos, setSharedTodos] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    loadMyTodos();
  }, []);

  async function loadMyTodos() {
    const { data } = await api.get("/todos");
    setTodos(data.todos);
  }

  async function createTodo(event) {
    event.preventDefault();
    try {
      setError("");
      const { data } = await api.post("/todos", { title });
      setTodos((prev) => [data.todo, ...prev]);
      setTitle("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create todo.");
    }
  }

  async function toggleTodo(todo) {
    const { data } = await api.patch(`/todos/item/${todo._id}`, {
      completed: !todo.completed
    });
    setTodos((prev) => prev.map((item) => (item._id === todo._id ? data.todo : item)));
  }

  async function updateTitle(todo, nextTitle) {
    const { data } = await api.patch(`/todos/item/${todo._id}`, { title: nextTitle });
    setTodos((prev) => prev.map((item) => (item._id === todo._id ? data.todo : item)));
  }

  async function removeTodo(id) {
    await api.delete(`/todos/item/${id}`);
    setTodos((prev) => prev.filter((todo) => todo._id !== id));
  }

  async function viewSharedTodos(event) {
    event.preventDefault();
    try {
      setError("");
      const { data } = await api.get(`/todos/${sharedUsername.trim()}`);
      setSharedTodos(data.todos);
    } catch (err) {
      setError(err.response?.data?.message || "Cannot load shared todos.");
      setSharedTodos([]);
    }
  }

  return (
    <section className="page">
      <div className="page-header">
        <h1>My Focus Board</h1>
        <p className="muted">Welcome back, {user?.username}</p>
      </div>
      <form className="row-form add-todo-form" onSubmit={createTodo}>
        <input
          value={title}
          placeholder="Add a high-impact task"
          onChange={(e) => setTitle(e.target.value)}
        />
        <button type="submit">Add Todo</button>
      </form>
      {error && <p className="error">{error}</p>}
      {todos.length === 0 ? (
        <div className="empty-card">
          <h3>No tasks yet</h3>
          <p>Start with one small task and keep your momentum rolling.</p>
        </div>
      ) : (
        <ul className="list">
          {todos.map((todo) => (
            <TodoRow
              key={todo._id}
              todo={todo}
              onToggle={() => toggleTodo(todo)}
              onDelete={() => removeTodo(todo._id)}
              onUpdate={updateTitle}
            />
          ))}
        </ul>
      )}

      <div className="shared-card">
        <h2>Friend Shared Todos</h2>
        <form className="row-form" onSubmit={viewSharedTodos}>
          <input
            value={sharedUsername}
            placeholder="Friend username"
            onChange={(e) => setSharedUsername(e.target.value)}
          />
          <button type="submit">View</button>
        </form>
        <ul className="list">
          {sharedTodos.map((todo) => (
            <li key={todo._id} className="shared-item">
              {todo.title}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function TodoRow({ todo, onToggle, onDelete, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(todo.title);

  async function onSubmit(event) {
    event.preventDefault();
    await onUpdate(todo, value);
    setEditing(false);
  }

  return (
    <li className={`todo-row ${todo.completed ? "completed" : ""}`}>
      <input className="todo-checkbox" type="checkbox" checked={todo.completed} onChange={onToggle} />
      {editing ? (
        <form onSubmit={onSubmit} className="inline-form">
          <input value={value} onChange={(e) => setValue(e.target.value)} />
          <button type="submit">Save</button>
        </form>
      ) : (
        <span className={todo.completed ? "done" : ""}>{todo.title}</span>
      )}
      <button type="button" onClick={() => setEditing((prev) => !prev)}>
        Edit
      </button>
      <button type="button" className="danger-button" onClick={onDelete}>
        Delete
      </button>
    </li>
  );
}
