const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

// Import Middlewares and Routes
const { generalLimiter, apiLimiter } = require("./middlewares/rateLimiter");
const coinHistoryRoute = require("./routes/coinHistory");
const coinsPricesRoute = require("./routes/coinsPrices");
const candlestickRoute = require("./routes/coinCandlestick");
const searchCoinsRoute = require("./routes/searchCoins");
const top10VolumeRoute = require("./routes/top10Volume");
const newsRoute = require("./routes/news");
const authRoute = require("./routes/auth"); // Import the new auth route
const pool = require("./utils/db"); // Import pool to ensure connection is tested on startup

const app = express();
const PORT = process.env.PORT || 4000;

// --- Middlewares ---
app.use(cors()); // Enable CORS for all origins
app.use(express.json()); // Middleware to parse JSON request bodies
app.use(generalLimiter); // Apply general rate limiting to all requests

// --- API Routes ---
// Existing routes with specific rate limiting
app.use("/api/coin/history", apiLimiter, coinHistoryRoute);
app.use("/api/coins/prices", apiLimiter, coinsPricesRoute);
app.use("/api/coin/candlestick", apiLimiter, candlestickRoute);
app.use("/api/search-coins", apiLimiter, searchCoinsRoute);
app.use("/api/top-10-volume", apiLimiter, top10VolumeRoute);
app.use("/api/news", apiLimiter, newsRoute);

// Authentication routes (using general limiter)
app.use("/api/auth", authRoute);

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  // Optional: Check DB connection status again after server starts
  pool.query("SELECT 1")
    .then(() => console.log("MySQL connection verified after server start."))
    .catch(err => console.error("MySQL connection error after server start:", err));
});
