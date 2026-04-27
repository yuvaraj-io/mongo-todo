import  React,{ useEffect, useMemo, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5050/api";

export default function App() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [editingId, setEditingId] = useState("");
  const [editingTitle, setEditingTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const remainingCount = useMemo(
    () => todos.filter((todo) => !todo.completed).length,
    [todos]
  );

  async function request(path, options) {
    const response = await fetch(`${API_URL}${path}`, {
      headers: {
        "Content-Type": "application/json"
      },
      ...options
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || "Request failed.");
    }

    if (response.status === 204) {
      return null;
    }

    return response.json();
  }

  async function loadTodos() {
    try {
      setError("");
      const data = await request("/todos");
      setTodos(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function addTodo(event) {
    event.preventDefault();

    if (!title.trim()) {
      return;
    }

    try {
      setError("");
      const createdTodo = await request("/todos", {
        method: "POST",
        body: JSON.stringify({ title })
      });
      setTodos((currentTodos) => [createdTodo, ...currentTodos]);
      setTitle("");
    } catch (err) {
      setError(err.message);
    }
  }

  async function toggleTodo(todo) {
    try {
      setError("");
      const updatedTodo = await request(`/todos/${todo._id}`, {
        method: "PATCH",
        body: JSON.stringify({ completed: !todo.completed })
      });
      setTodos((currentTodos) =>
        currentTodos.map((item) => (item._id === todo._id ? updatedTodo : item))
      );
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteTodo(id) {
    try {
      setError("");
      await request(`/todos/${id}`, { method: "DELETE" });
      setTodos((currentTodos) => currentTodos.filter((todo) => todo._id !== id));
      if (editingId === id) {
        setEditingId("");
        setEditingTitle("");
      }
    } catch (err) {
      setError(err.message);
    }
  }

  async function createStarterTodo() {
    try {
      setError("");
      const createdTodo = await request("/todos", {
        method: "POST",
        body: JSON.stringify({ title: "My first task" })
      });
      setTodos((currentTodos) => [createdTodo, ...currentTodos]);
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteAllTodos() {
    if (todos.length === 0) {
      return;
    }

    try {
      setError("");
      await Promise.all(todos.map((todo) => request(`/todos/${todo._id}`, { method: "DELETE" })));
      setTodos([]);
      cancelEditing();
    } catch (err) {
      setError(err.message);
    }
  }

  function startEditing(todo) {
    setEditingId(todo._id);
    setEditingTitle(todo.title);
    setError("");
  }

  function cancelEditing() {
    setEditingId("");
    setEditingTitle("");
  }

  async function updateTodo(event, id) {
    event.preventDefault();

    const trimmedTitle = editingTitle.trim();
    if (!trimmedTitle) {
      setError("Todo title is required.");
      return;
    }

    try {
      setError("");
      const updatedTodo = await request(`/todos/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ title: trimmedTitle })
      });
      setTodos((currentTodos) =>
        currentTodos.map((item) => (item._id === id ? updatedTodo : item))
      );
      cancelEditing();
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadTodos();
  }, []);

  return (
    <main className="app-shell">
      <section className="hero-card">
        <p className="eyebrow">Mongo powered</p>
        <h1>Todo rhythm, minus the clutter.</h1>
        <p className="subtitle">
          Add tiny tasks, check them off, and keep the day moving.
        </p>

        <form className="todo-form" onSubmit={addTodo}>
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="What needs doing?"
            aria-label="Todo title"
          />
          <button type="submit">Add</button>
        </form>

        {error && <p className="error">{error}</p>}

        <div className="status-row">
          <span>{remainingCount} left</span>
          <span>{todos.length} total</span>
        </div>

        <div className="global-actions">
          <button type="button" className="ghost-button" onClick={createStarterTodo}>
            Create first todo
          </button>
          <button
            type="button"
            className="delete-button"
            onClick={deleteAllTodos}
            disabled={todos.length === 0}
          >
            Delete all
          </button>
        </div>

        {loading ? (
          <p className="empty-state">Loading todos...</p>
        ) : todos.length === 0 ? (
          <div className="empty-state-block">
            <p className="empty-state">No todos yet. Create one to unlock edit and delete per item.</p>
            <button className="save-button" type="button" onClick={createStarterTodo}>
              Create first todo
            </button>
          </div>
        ) : (
          <ul className="todo-list">
            {todos.map((todo) => (
              <li key={todo._id} className={todo.completed ? "is-done" : ""}>
                <button
                  className="check-button"
                  type="button"
                  onClick={() => toggleTodo(todo)}
                  aria-label={todo.completed ? "Mark incomplete" : "Mark complete"}
                >
                  {todo.completed ? "✓" : ""}
                </button>

                {editingId === todo._id ? (
                  <form className="edit-form" onSubmit={(event) => updateTodo(event, todo._id)}>
                    <input
                      type="text"
                      value={editingTitle}
                      onChange={(event) => setEditingTitle(event.target.value)}
                      aria-label="Edit todo title"
                    />
                    <div className="todo-actions">
                      <button className="save-button" type="submit">
                        Save
                      </button>
                      <button className="ghost-button" type="button" onClick={cancelEditing}>
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <span>{todo.title}</span>
                    <div className="todo-actions">
                      <button
                        className="ghost-button"
                        type="button"
                        onClick={() => startEditing(todo)}
                      >
                        Edit
                      </button>
                      <button
                        className="delete-button"
                        type="button"
                        onClick={() => deleteTodo(todo._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
