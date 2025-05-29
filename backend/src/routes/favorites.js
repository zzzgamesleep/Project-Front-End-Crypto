const express = require("express");
const router = express.Router();
const pool = require("../utils/db");
const authMiddleware = require("../middlewares/authMiddleware");

// @route   GET api/favorites
// @desc    Get all favorite coins for the logged-in user
// @access  Private
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id; // Get user ID from middleware
    const [favorites] = await pool.query(
      "SELECT coin_symbol FROM favorites WHERE user_id = ?",
      [userId]
    );
    
    // Extract just the symbols into an array
    const favoriteSymbols = favorites.map(fav => fav.coin_symbol);

    res.json({ favorites: favoriteSymbols });
  } catch (err) {
    console.error("Error fetching favorites:", err.message);
    res.status(500).send("Server Error");
  }
});

// @route   POST api/favorites
// @desc    Add a coin to favorites
// @access  Private
router.post("/", authMiddleware, async (req, res) => {
  const { symbol } = req.body;
  const userId = req.user.id;

  if (!symbol) {
    return res.status(400).json({ message: "Coin symbol is required" });
  }

  try {
    // Check if already favorited
    const [existing] = await pool.query(
      "SELECT * FROM favorites WHERE user_id = ? AND coin_symbol = ?",
      [userId, symbol]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "Coin already in favorites" });
    }

    // Add to favorites
    await pool.query(
      "INSERT INTO favorites (user_id, coin_symbol) VALUES (?, ?)",
      [userId, symbol]
    );

    res.status(201).json({ message: "Coin added to favorites" });
  } catch (err) {
    console.error("Error adding favorite:", err.message);
    // Handle potential duplicate entry error if primary key constraint is violated (though checked above)
    if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: "Coin already in favorites (concurrent request?)" });
    }
    res.status(500).send("Server Error");
  }
});

// @route   DELETE api/favorites/:symbol
// @desc    Remove a coin from favorites
// @access  Private
router.delete("/:symbol", authMiddleware, async (req, res) => {
  const { symbol } = req.params;
  const userId = req.user.id;

  try {
    const [result] = await pool.query(
      "DELETE FROM favorites WHERE user_id = ? AND coin_symbol = ?",
      [userId, symbol]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Favorite coin not found" });
    }

    res.json({ message: "Coin removed from favorites" });
  } catch (err) {
    console.error("Error removing favorite:", err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;

