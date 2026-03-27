const express = require("express");
const pool = require("../db");
const multer = require("multer");
const path = require("path");
const { requireAdmin } = require("../middleware/auth"); // ✅ JWT admin middleware

const router = express.Router();

// ✅ protect everything in this router with admin JWT
router.use(requireAdmin);

// ---- Multer config ----
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "..", "uploads")); // server/uploads
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = `gem_${Date.now()}_${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, safeName);
  },
});

function fileFilter(req, file, cb) {
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Only JPG, PNG, WEBP images are allowed"), false);
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// GET /api/admin/gems
router.get("/", async (req, res, next) => {
  try {
    const [rows] = await pool.query("SELECT * FROM gems ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/gems
router.post("/", async (req, res, next) => {
  try {
    const { name, gem_type, color, hardness, origin, description, image_url } = req.body;

    if (!name || !gem_type) {
      return res.status(400).json({ message: "name and gem_type are required" });
    }

    const [result] = await pool.query(
      `INSERT INTO gems (name, gem_type, color, hardness, origin, description, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        gem_type,
        color || null,
        hardness ?? null,
        origin || null,
        description || null,
        image_url || null,
      ]
    );

    const [rows] = await pool.query("SELECT * FROM gems WHERE id = ?", [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/gems/:id
router.put("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { name, gem_type, color, hardness, origin, description, image_url } = req.body;

    if (!name || !gem_type) {
      return res.status(400).json({ message: "name and gem_type are required" });
    }

    const [result] = await pool.query(
      `UPDATE gems
       SET name=?, gem_type=?, color=?, hardness=?, origin=?, description=?, image_url=?
       WHERE id=?`,
      [
        name,
        gem_type,
        color || null,
        hardness ?? null,
        origin || null,
        description || null,
        image_url || null,
        id,
      ]
    );

    if (result.affectedRows === 0) return res.status(404).json({ message: "Gem not found" });

    const [rows] = await pool.query("SELECT * FROM gems WHERE id = ?", [id]);
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/gems/:id/image  (upload image file)
router.post("/:id/image", upload.single("image"), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!req.file) return res.status(400).json({ message: "No image file uploaded" });

    // Save relative URL in DB
    const imageUrl = `/uploads/${req.file.filename}`;

    const [result] = await pool.query("UPDATE gems SET image_url = ? WHERE id = ?", [
      imageUrl,
      id,
    ]);

    if (result.affectedRows === 0) return res.status(404).json({ message: "Gem not found" });

    const [rows] = await pool.query("SELECT * FROM gems WHERE id = ?", [id]);
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/gems/:id
router.delete("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const [result] = await pool.query("DELETE FROM gems WHERE id = ?", [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: "Gem not found" });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;