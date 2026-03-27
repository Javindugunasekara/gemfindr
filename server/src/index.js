require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const pool = require("./db");
const { buildIndex } = require("./chatEngine");

const gemsRouter = require("./routes/gems");
const locationsRouter = require("./routes/locations");
const chatRouter = require("./routes/chat");

const adminGemsRouter = require("./routes/adminGems");
const adminLocationsRouter = require("./routes/adminLocations");
const adminChunksRouter = require("./routes/adminChunks");

const authRouter = require("./routes/auth");
const { requireAuth, requireAdmin } = require("./middleware/auth");

const app = express();

app.use(cors());
app.use(express.json());

// uploads
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// auth (public)
app.use("/api/auth", authRouter);

// protected (user login required)
app.use("/api/chat", requireAuth, chatRouter);
app.use("/api/gems", requireAuth, gemsRouter);
app.use("/api/locations", requireAuth, locationsRouter);

// admin protected (admin login required)
app.use("/api/admin/gems", requireAdmin, adminGemsRouter);
app.use("/api/admin/locations", requireAdmin, adminLocationsRouter);
app.use("/api/admin/chunks", requireAdmin, adminChunksRouter);

buildIndex().catch(console.error);

app.get("/api/health", (req, res) => res.json({ status: "OK" }));

app.get("/api/test-db", async (req, res, next) => {
  try {
    const [rows] = await pool.query("SELECT COUNT(*) AS totalGems FROM gems");
    const [rows2] = await pool.query("SELECT COUNT(*) AS totalLocations FROM locations");
    res.json({ totalGems: rows[0].totalGems, totalLocations: rows2[0].totalLocations });
  } catch (e) {
    next(e);
  }
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Server error", error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running: http://localhost:${PORT}`));