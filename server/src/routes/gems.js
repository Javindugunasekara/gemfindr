const express = require("express");
const pool = require("../db");

const router = express.Router();

// GET all gems
router.get("/", async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, gem_type, color, hardness, origin, image_url FROM gems ORDER BY id DESC"
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET gem by id
router.get("/:id", async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM gems WHERE id = ?", [
    req.params.id,
  ]);
  if (rows.length === 0) return res.status(404).json({ message: "Gem not found" });
  res.json(rows[0]);
});

module.exports = router;
