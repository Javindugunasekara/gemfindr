const express = require("express");
const bcrypt = require("bcryptjs");
const pool = require("../db");
const { signToken, requireAuth } = require("../middleware/auth");

const router = express.Router();

const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email, role: u.role });

// USER REGISTER (role=user)
router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) return res.status(400).json({ message: "name, email, password required" });
    if (password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });

    const [exists] = await pool.query("SELECT id FROM users WHERE email=?", [email]);
    if (exists.length) return res.status(409).json({ message: "Email already registered" });

    const password_hash = await bcrypt.hash(password, 10);
    const [ins] = await pool.query(
      "INSERT INTO users (name,email,password_hash,role) VALUES (?,?,?, 'user')",
      [name, email, password_hash]
    );

    const [rows] = await pool.query("SELECT id,name,email,role FROM users WHERE id=?", [ins.insertId]);
    const user = rows[0];
    const token = signToken(user);
    res.json({ token, user: publicUser(user) });
  } catch (e) {
    next(e);
  }
});

// USER LOGIN
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: "email and password required" });

    const [rows] = await pool.query("SELECT * FROM users WHERE email=?", [email]);
    if (!rows.length) return res.status(401).json({ message: "Invalid email or password" });

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ message: "Invalid email or password" });

    const token = signToken(user);
    res.json({ token, user: publicUser(user) });
  } catch (e) {
    next(e);
  }
});

// ADMIN LOGIN (must be role=admin)
router.post("/admin-login", async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: "email and password required" });

    const [rows] = await pool.query("SELECT * FROM users WHERE email=?", [email]);
    if (!rows.length) return res.status(401).json({ message: "Invalid email or password" });

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ message: "Invalid email or password" });

    if (user.role !== "admin") return res.status(403).json({ message: "Not an admin account" });

    const token = signToken(user);
    res.json({ token, user: publicUser(user) });
  } catch (e) {
    next(e);
  }
});

// ME
router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const [rows] = await pool.query("SELECT id,name,email,role FROM users WHERE id=?", [req.user.id]);
    if (!rows[0]) return res.status(401).json({ message: "Unauthorized" });
    res.json({ user: publicUser(rows[0]) });
  } catch (e) {
    next(e);
  }
});

module.exports = router;