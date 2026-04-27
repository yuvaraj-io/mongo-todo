import { useEffect, useMemo, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function App() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
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

        {loading ? (
          <p className="empty-state">Loading todos...</p>
        ) : todos.length === 0 ? (
          <p className="empty-state">No todos yet. A blank canvas, suspiciously peaceful.</p>
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
                <span>{todo.title}</span>
                <button
                  className="delete-button"
                  type="button"
                  onClick={() => deleteTodo(todo._id)}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
