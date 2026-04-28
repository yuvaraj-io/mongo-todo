export function notFound(_req, res) {
  res.status(404).json({ message: "Route not found." });
}

export function errorHandler(error, _req, res, _next) {
  const status = error.status || 500;
  const message = error.message || "Internal server error.";
  console.error(error);
  res.status(status).json({ message });
}

