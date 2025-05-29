const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET is not defined in .env file.");
  process.exit(1);
}

const authMiddleware = (req, res, next) => {
  // Get token from header
  const authHeader = req.header("Authorization");

  // Check if not token
  if (!authHeader) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  // Check if token format is correct (Bearer <token>)
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({ message: "Token format is invalid" });
  }

  const token = parts[1];

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Add user from payload to request object
    req.user = decoded.user;
    next();
  } catch (err) {
    console.error("Token verification failed:", err.message);
    res.status(401).json({ message: "Token is not valid" });
  }
};

module.exports = authMiddleware;
