const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  // Get token from the request header
  const authHeader = req.header("Authorization");

  // Check if token exists
  if (!authHeader) {
    return res.status(401).json({
      message: "No token, authorization denied",
    });
  }

  try {
    // The header format is "Bearer <token>". We split and get the token part.
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Token format is incorrect, authorization denied",
      });
    }

    // Verify the token using our secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // If token is valid, add the user's payload to the request object
    // Now, any subsequent route handler can access req.user
    req.user = decoded.user;

    // Pass control to the next middleware or route handler
    next();
  } catch (error) {
    res.status(401).json({ message: "Token is not valid" });
  }
};
