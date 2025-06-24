// This middleware assumes that the 'authenticate' middleware has already run.
// It checks the role attached to the req.user object.

const authorizeAdmin = (req, res, next) => {
  // We can access req.user because the preceding 'authenticate' middleware set it.
  if (req.user && req.user.role === "admin") {
    // If the user is an admin, pass control to the next function (the route handler).
    next();
  } else {
    // Senior Dev Decision: Use status 403 Forbidden.
    // 401 Unauthorized means "You are not logged in."
    // 403 Forbidden means "You are logged in, but you don't have permission to do this."
    res.status(403).json({ message: "Forbidden: Admins only" });
  }
};

module.exports = authorizeAdmin;
