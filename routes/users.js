const express = require("express");

// Create a new router object
const router = express.Router();

// Node.js built-in modules for working with the file system
const fs = require("fs/promises");
const path = require("path");

// Path to our JSON database file
const DATA_FILE = path.join(__dirname, "..", "data", "users.json");

// --- ROUTES ---

// **This route's path is now '/', but it will be mounted under '/api/users' in index.js
// **description: Get all users
// **route:       GET /api/users
router.get("/", async (req, res, next) => {
  try {
    // Read the contents of the database file asynchronously
    const data = await fs.readFile(DATA_FILE, "utf-8");
    // Parse the JSON data into a Javascript array
    const users = JSON.parse(data);
    res.json(users);
  } catch (error) {
    // If anything goes wrong (e.g., file not found, bad JSON),
    // pass the error to our centralized error handler.
    next(error);
  }
});

// **description: Get a single user by their ID
// **route:       GET /api/users/:id
router.get("/:id", async (req, res, next) => {
  try {
    // req.params contains route parameters. The 'id' comes from the ':id' in the URL.
    // It's a string by default, so we parse it to an integer.
    const userId = parseInt(req.params.id);

    // Read the contents of the database file asynchronously
    const data = await fs.readFile(DATA_FILE, "utf-8");
    // Parse the JSON data into a Javascript array
    const users = JSON.parse(data);

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
  } catch (error) {
    next(error);
  }
});

// **description: Create a new user
// **route:       POST /api/users
router.post("/", async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) {
      // For user input errors, we can send a specific error right away.
      return res.status(400).json({
        message: "User name is required.",
      });
    }

    // Read the current users
    const data = await fs.readFile(DATA_FILE, "utf-8");
    const users = JSON.parse(data);

    // Create the new user
    const newUser = {
      // Simple ID generation (find the max current ID and add 1)
      id: Math.max(...users.map((u) => u.id)) + 1,
      name: name,
    };

    users.push(newUser);

    // Write the entire updated array back to the file
    // The 'null, 2' arguments pretty-print the JSON to make it readable
    await fs.writeFile(DATA_FILE, JSON.stringify(users, null, 2));

    res.status(201).json(newUser);
  } catch (error) {
    next(error);
  }
});

// Export the router
module.exports = router;
