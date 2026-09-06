/**
 * Centralized error handler. Every route should call next(err) on failure
 * rather than sending its own error response, so the client always gets a
 * consistent { error: "..." } shape and the server never leaks a raw stack
 * trace (per docs/API.md conventions).
 */
export function errorHandler(err, req, res, next) {
  console.error(`❌ [${req.method} ${req.originalUrl}]`, err.message);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || "Internal server error" });
}

export function notFoundHandler(req, res) {
  res.status(404).json({ error: `No route for ${req.method} ${req.originalUrl}` });
}
