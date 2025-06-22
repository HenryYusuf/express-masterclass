require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");

// --- SETUP ---
const app = express();
const PORT = process.env.PORT || 3000;

// --- CUSTOM MIDDLEWARE ---

// This is a custom logger middleware.
// It runs for every single request that comes into the server.
const logger = (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next(); // CRUCIAL: Call next() to pass control to the next middleware/route
};

// --- GLOBAL MIDDLEWARE ---

// The order of global middleware matters.
// CORS: Handle cross-origin request first.
app.use(cors());

// Helmet: Apply security headers early.
app.use(helmet());

// We MUST register our middleware before our routes. The order is importabt.
// Logger: Log the request.
app.use(logger); // Use our custom logger for all requests

// This is a built-in Express middleware.
// It parses incoming request with JSON payloads. Without this, req.body would be undefined.
// Body Parser: Parse JSON bodies
app.use(express.json());

// --- ROUTES ---
// Mount the user routes.
// Any request starting with '/api/users' will be handled by the 'userRoutes' router.
// Import the user routes from the other file
const userRoutes = require("./routes/users");
app.use("/api/users", userRoutes);

// --- CATCH-ALL ERROR HANDLING MIDDLEWARE ---
// This middleware will run if any route handler calls next(error)
app.use((err, req, res, next) => {
  // Log the error for debugging purposes.
  // In a real production app, you'd log to a file or a logging service.
  console.error(err.stack);

  // Send a generic, user-friendly error response.
  // Don't leak implementation details to the client.
  res.status(500).json({
    message: "Something went wrong on the server. Please try again later.",
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
