const express = require("express");
const pool = require("../db");

const router = express.Router();

// GET all locations
router.get("/", async (req, res) => {
  const [rows] = await pool.query(
    "SELECT id, name, location_type, district, address, lat, lng FROM locations ORDER BY id DESC"
  );
  res.json(rows);
});

module.exports = router;
