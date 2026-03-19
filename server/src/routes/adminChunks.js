const express = require("express");
const pool = require("../db");
const adminAuth = require("../middleware/adminAuth");

const router = express.Router();
router.use(adminAuth);

// GET /api/admin/chunks
router.get("/", async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM knowledge_chunks ORDER BY id DESC"
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/chunks
router.post("/", async (req, res, next) => {
  try {
    const {
      entity_type,
      entity_id,
      title,
      content,
      tags,
      source,
      reliability,
      language,
    } = req.body;

    if (!entity_type || !title || !content) {
      return res.status(400).json({ message: "entity_type, title, content are required" });
    }

    const [result] = await pool.query(
      `INSERT INTO knowledge_chunks
        (entity_type, entity_id, title, content, tags, source, reliability, language)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        entity_type,
        entity_id ?? null,
        title,
        content,
        tags || null,
        source || null,
        reliability ?? 3,
        language || "en",
      ]
    );

    const [rows] = await pool.query("SELECT * FROM knowledge_chunks WHERE id = ?", [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/chunks/:id
router.put("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const {
      entity_type,
      entity_id,
      title,
      content,
      tags,
      source,
      reliability,
      language,
    } = req.body;

    if (!entity_type || !title || !content) {
      return res.status(400).json({ message: "entity_type, title, content are required" });
    }

    const [result] = await pool.query(
      `UPDATE knowledge_chunks
       SET entity_type=?, entity_id=?, title=?, content=?, tags=?, source=?, reliability=?, language=?
       WHERE id=?`,
      [
        entity_type,
        entity_id ?? null,
        title,
        content,
        tags || null,
        source || null,
        reliability ?? 3,
        language || "en",
        id,
      ]
    );

    if (result.affectedRows === 0) return res.status(404).json({ message: "Chunk not found" });

    const [rows] = await pool.query("SELECT * FROM knowledge_chunks WHERE id = ?", [id]);
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/chunks/:id
router.delete("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const [result] = await pool.query("DELETE FROM knowledge_chunks WHERE id = ?", [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: "Chunk not found" });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;