const express = require("express");

// Create a new router object
const router = express.Router();

// Database query function
const db = require("../config/db");

// Node.js built-in modules for working with the file system
const fs = require("fs/promises");
const path = require("path");

// --- ROUTES ---

// **This route's path is now '/', but it will be mounted under '/api/users' in index.js
// **description: Get all users
// **route:       GET /api/users
router.get("/", async (req, res, next) => {
  try {
    // db.query returns a promise, so we can use await
    const { rows } = await db.query("SELECT * FROM users ORDER BY id ASC");
    res.json(rows);
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
    const { id } = req.params;

    // Always use parameterized queries to prevent SQL injection
    // The driver (`pg`) sanitizes the input. '$1' is a placeholder for the first item in the array.
    const sqlQuery = "SELECT * FROM users WHERE id = $1";
    const { rows } = await db.query(sqlQuery, [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json(rows[0]);
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
        message: "Name is required.",
      });
    }

    // 'RETURNING *' is a PostgreSQL feature that returns the entire new row.
    const sqlQuery = "INSERT INTO users (name) VALUES ($1) RETURNING *";
    const { rows } = await db.query(sqlQuery, [name]);

    res.status(201).json(rows[0]);
  } catch (error) {
    next(error);
  }
});

// **description: Update an existing user's name
// **route:       PUT /api/users/:id
router.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(404).json({
        message: "Name is required",
      });
    }

    const sqlQuery = "UPDATE users SET name = $1 WHERE id = $2 RETURNING *";
    const { rows } = await db.query(sqlQuery, [name, id]);

    // Check if a row was actually updated. If not, the user was not found.
    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
});

// **description: Delete a user by their ID
// **route:       DELETE /api/users/:id
router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    // The result object from a DELETE query contains a 'rowCount' property.
    const sqlQuery = "DELETE FROM users WHERE id = $1";
    const result = await db.query(sqlQuery, [id]);

    // Check if any row was actually deleted.
    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // The standard, conventional response for a successful DELETE
    // operation is a 204 "No Content" status with no response body.
    res.status(204).json([]);
  } catch (error) {
    next(error);
  }
});

// Export the router
module.exports = router;
