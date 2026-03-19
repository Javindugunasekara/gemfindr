const express = require("express");
const router = express.Router();
const { searchDatabase } = require("../chatSearch");

// GET for quick browser test
router.get("/", (req, res) => {
  res.json({ ok: true, note: "Use POST /api/chat with JSON { message: '...' }" });
});

// DB-only chatbot
router.post("/", async (req, res, next) => {
  try {
    const message = (req.body?.message || "").trim();
    if (!message) return res.status(400).json({ answer: "Please type a question." });

    // ✅ Only database search (no AI)
    const result = await searchDatabase(message);

    // Ensure answer always exists
    if (!result || typeof result.answer !== "string") {
      return res.json({
        answer: "I couldn't generate an answer from the database. Try a gem name like 'Blue Sapphire'.",
        ...result,
      });
    }

    return res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;