const pool = require("../utils/db"); // Import the database connection pool

const Favorite = {
  // Find all favorite coin symbols for a given user ID
  async findByUserId(userId) {
    const query = "SELECT coin_symbol FROM favorites WHERE user_id = ? ORDER BY created_at DESC";
    try {
      const [rows] = await pool.query(query, [userId]);
      // Return an array of coin symbols
      return rows.map(row => row.coin_symbol);
    } catch (error) {
      console.error("Error finding favorites by user ID:", error);
      throw error; // Re-throw the error to be handled by the controller/route
    }
  },

  // Add a new favorite coin for a user
  async add(userId, coinSymbol) {
    const query = "INSERT INTO favorites (user_id, coin_symbol) VALUES (?, ?)";
    try {
      const [result] = await pool.query(query, [userId, coinSymbol]);
      return result;
    } catch (error) {
      // Handle potential duplicate entry error (user already favorited this coin)
      if (error.code === "ER_DUP_ENTRY") {
        console.warn(`User ${userId} already favorited ${coinSymbol}`);
        // Optionally return a specific indicator or just let it fail silently depending on desired UX
        return { affectedRows: 0, warning: "Already favorited" }; 
      }
      console.error("Error adding favorite:", error);
      throw error;
    }
  },

  // Remove a favorite coin for a user
  async remove(userId, coinSymbol) {
    const query = "DELETE FROM favorites WHERE user_id = ? AND coin_symbol = ?";
    try {
      const [result] = await pool.query(query, [userId, coinSymbol]);
      // Check if a row was actually deleted
      if (result.affectedRows === 0) {
        console.warn(`Favorite not found for user ${userId} and coin ${coinSymbol}`);
        // Optionally return an indicator that the favorite wasn't found
      }
      return result;
    } catch (error) {
      console.error("Error removing favorite:", error);
      throw error;
    }
  },

  // Check if a specific coin is favorited by a user (optional helper)
  async isFavorite(userId, coinSymbol) {
    const query = "SELECT 1 FROM favorites WHERE user_id = ? AND coin_symbol = ? LIMIT 1";
    try {
      const [rows] = await pool.query(query, [userId, coinSymbol]);
      return rows.length > 0;
    } catch (error) {
      console.error("Error checking if favorite:", error);
      throw error;
    }
  }
};

module.exports = Favorite;