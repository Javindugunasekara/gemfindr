const jwt = require("jsonwebtoken");

function signToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function requireAuth(req, res, next) {
  const auth = req.headers.authorization || "";
  if (!auth.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: login required" });
  }
  try {
    req.user = jwt.verify(auth.slice(7), process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: "Unauthorized: invalid token" });
  }
}

function requireAdmin(req, res, next) {
  const auth = req.headers.authorization || "";
  if (!auth.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: admin login required" });
  }
  try {
    const user = jwt.verify(auth.slice(7), process.env.JWT_SECRET);
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: admin only" });
    }
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: "Unauthorized: invalid token" });
  }
}

module.exports = { signToken, requireAuth, requireAdmin };