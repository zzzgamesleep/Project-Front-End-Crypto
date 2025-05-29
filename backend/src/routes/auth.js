const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../utils/db");
require("dotenv").config();

const router = express.Router();
const saltRounds = 10; // For bcrypt hashing

// --- Registration Route --- 
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  // Basic Input Validation
  if (!username || !email || !password) {
    return res.status(400).json({ message: "Username, email, and password are required." });
  }

  // More robust validation can be added here (e.g., email format, password strength)

  let connection;
  try {
    connection = await pool.getConnection();

    // Check if username or email already exists
    const [existingUsers] = await connection.query(
      "SELECT id FROM users WHERE username = ? OR email = ?",
      [username, email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({ message: "Username or email already exists." });
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert the new user
    const [result] = await connection.query(
      "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
      [username, email, passwordHash]
    );

    res.status(201).json({ message: "User registered successfully.", userId: result.insertId });

  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Internal server error during registration." });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// --- Login Route --- 
router.post("/login", async (req, res) => {
  const { email, password } = req.body; // Assuming login via email

  // Basic Input Validation
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  let connection;
  try {
    connection = await pool.getConnection();

    // Find user by email
    const [users] = await connection.query(
      "SELECT id, username, email, password_hash FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: "Invalid email or password." }); // Use generic message for security
    }

    const user = users[0];

    // Compare password with hash
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." }); // Use generic message
    }

    // Generate JWT token
    // Đúng cấu trúc như middleware mong đợi:
    const payload = {
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    };

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("JWT_SECRET is not defined in .env file!");
      return res.status(500).json({ message: "Internal server error: JWT configuration missing." });
    }
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.status(200).json({
      message: "Login successful.",
      token: token,
      user: { id: user.id, username: user.username, email: user.email }
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error during login." });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

module.exports = router;