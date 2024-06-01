const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("./config");

const authMiddleware = (req, res, next) => {
  const authorizationToken = req.headers.authorization;

  if (!authorizationToken || !authorizationToken.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "Authorization token is missing or invalid." });
  }

  const token = authorizationToken.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token has expired." });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Token is invalid." });
    }
    return res.status(500).json({ error: "Internal server error." });
  }
};

module.exports = authMiddleware;
