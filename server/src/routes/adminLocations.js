const express = require("express");
const pool = require("../db");
const adminAuth = require("../middleware/adminAuth");

const router = express.Router();
router.use(adminAuth);

// GET /api/admin/locations
router.get("/", async (req, res, next) => {
  try {
    const [rows] = await pool.query("SELECT * FROM locations ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/locations
router.post("/", async (req, res, next) => {
  try {
    const { name, location_type, district, address, lat, lng, description } = req.body;

    if (!name || !location_type || lat === undefined || lng === undefined) {
      return res.status(400).json({ message: "name, location_type, lat, lng are required" });
    }

    const [result] = await pool.query(
      `INSERT INTO locations (name, location_type, district, address, lat, lng, description)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        location_type,
        district || null,
        address || null,
        Number(lat),
        Number(lng),
        description || null,
      ]
    );

    const [rows] = await pool.query("SELECT * FROM locations WHERE id = ?", [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/locations/:id
router.put("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { name, location_type, district, address, lat, lng, description } = req.body;

    if (!name || !location_type || lat === undefined || lng === undefined) {
      return res.status(400).json({ message: "name, location_type, lat, lng are required" });
    }

    const [result] = await pool.query(
      `UPDATE locations
       SET name=?, location_type=?, district=?, address=?, lat=?, lng=?, description=?
       WHERE id=?`,
      [
        name,
        location_type,
        district || null,
        address || null,
        Number(lat),
        Number(lng),
        description || null,
        id,
      ]
    );

    if (result.affectedRows === 0) return res.status(404).json({ message: "Location not found" });

    const [rows] = await pool.query("SELECT * FROM locations WHERE id = ?", [id]);
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/locations/:id
router.delete("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const [result] = await pool.query("DELETE FROM locations WHERE id = ?", [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: "Location not found" });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;