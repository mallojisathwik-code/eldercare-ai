import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "eldercare-secret-dev";

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || typeof authHeader !== "string") {
    return res.status(401).json({ error: "Authorization header is required." });
  }

  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Authorization header must be in the format: Bearer <token>." });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = {
      id: payload.id,
      email: payload.email,
      role: payload.role,
    };
    return next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
}
