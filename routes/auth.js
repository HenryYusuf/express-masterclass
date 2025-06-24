const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

// validators
const { registerRules, validate } = require("../middleware/validators");

// **description: Register a new user
// **route:       POST /api/auth/register
router.post("/register", registerRules(), validate, async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const userExistsResult = await db.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (userExistsResult.rows.length > 0) {
      return res.status(400).json({
        message: "User with that email already exists",
      });
    }

    // Hash the password
    // A salt is random data added to the password before hashing to make it more secure.
    // 10 is the number of salt rounds - a good standard
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save the user to the database
    const newUserQuery =
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email";
    const { rows } = await db.query(newUserQuery, [
      name,
      email,
      hashedPassword,
    ]);

    res.status(201).json({
      message: "User registered successfully",
      user: rows[0],
    });
  } catch (error) {
    next(error);
  }
});

// **description: Login a user and return a JWT
// **route:       POST /api/auth/login
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        message: "Please enter all fields.",
      });
    }

    //   Find the user by email
    const { rows } = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    const user = rows[0];

    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials", // 401 Unauthorized
      });
    }

    //   Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    //   If password match, create a JWT
    const payload = {
      user: {
        id: user.id, // We'll use the user ID in our protected routes
        role: user.role,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (error) {
    next(error);
  }
});

module.exports = router;
