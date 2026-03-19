module.exports = function adminAuth(req, res, next) {
  const key = process.env.ADMIN_KEY;

  // If you didn't set ADMIN_KEY, allow everything (dev mode)
  if (!key) return next();

  const provided = req.header("x-admin-key");
  if (provided && provided === key) return next();

  return res.status(401).json({ message: "Unauthorized: invalid admin key" });
};