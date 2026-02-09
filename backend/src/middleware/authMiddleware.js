const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ code: "NO_TOKEN" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.userId = decoded.userId;

    next();
  } catch (err) {
    // ✅ Token expired
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ code: "TOKEN_EXPIRED" });
    }

    // ✅ Invalid / tampered token
    return res.status(401).json({ code: "INVALID_TOKEN" });
  }
};

module.exports = authMiddleware;
