const adminGemsRouter = require("./routes/adminGems");
const adminLocationsRouter = require("./routes/adminLocations");
const adminChunksRouter = require("./routes/adminChunks");

require("dotenv").config();
const express = require("express");
const cors = require("cors");

const path = require("path");
const gemsRouter = require("./routes/gems");
const locationsRouter = require("./routes/locations");
const chatRouter = require("./routes/chat");
const pool = require("./db");
const { buildIndex } = require("./chatEngine");

const app = express();

// ✅ middleware FIRST
app.use(cors());
app.use(express.json());

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// ✅ routes AFTER middleware
app.use("/api/chat", chatRouter);
app.use("/api/gems", gemsRouter);
app.use("/api/locations", locationsRouter);

app.use("/api/admin/gems", adminGemsRouter);
app.use("/api/admin/locations", adminLocationsRouter);
app.use("/api/admin/chunks", adminChunksRouter);
app.use("/uploads", express.static("uploads"));

buildIndex().catch(console.error);

// health check
app.get("/api/health", (req, res) => res.json({ status: "OK" }));

app.get("/api/test-db", async (req, res) => {
  const [rows] = await pool.query("SELECT COUNT(*) AS totalGems FROM gems");
  const [rows2] = await pool.query("SELECT COUNT(*) AS totalLocations FROM locations");
  res.json({ totalGems: rows[0].totalGems, totalLocations: rows2[0].totalLocations });
});

// error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Server error", error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running: http://localhost:${PORT}`));
