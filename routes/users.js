const express = require("express");

// Create a new router object
const router = express.Router();

// In-memory "Database"
let users = [
  { id: 1, name: "Henry" },
  { id: 2, name: "Yusuf" },
];

// --- ROUTES ---

// **This route's path is now '/', but it will be mounted under '/api/users' in index.js
// **description: Get all users
// **route:       GET /api/users
router.get("/", (req, res) => {
  // For APIs, always use res.json().
  // It automatically sets the correct Content-Type header to 'application/json'.
  res.json(users);
});

// **description: Get a single user by their ID
// **route:       GET /api/users/:id
router.get("/:id", (req, res) => {
  // req.params contains route parameters. The 'id' comes from the ':id' in the URL.
  // It's a string by default, so we parse it to an integer.
  const userId = parseInt(req.params.id);

  // Find the user in our "database" array.
  const user = users.find((u) => u.id === userId);

  if (!user) {
    // If the resource is not found, send a 404 status.
    // Always provide a clear message.
    return res.status(404).json({
      message: `User with ID ${userId} not found.`,
    });
  }

  // If the user is found, send it back as JSON.
  res.json(user);
});

// **description: Create a new user
// **route:       POST /api/users
router.post("/", (req, res) => {
  // We need the 'express.json()' middleware in index.js for this to work
  // req.body will contain the parsed JSON data.
  const newUser = req.body;

  // !   Basic validation. Never trust user input.
  if (!newUser.name) {
    return res.status(400).json({
      message: "User name is required",
    });
  }

  // Create a new user object with an ID
  const userToAdd = {
    id: users.length + 1, // Simple ID generation
    name: newUser.name,
  };

  users.push(userToAdd);

  // Send a 201 "Created" status and the new user object.
  res.status(201).json(userToAdd);
});

// Export the router
module.exports = router;
