const supertest = require("supertest");
const app = require("../app"); // Our configured Express app
const db = require("../config/db"); // We need this to clean up the database

// Wrap our app with supertest
const request = supertest(app);

// describe() is a jest function to group related tests
describe("Auth Routes", () => {
  // afterEach() is a Jest hook that runs after each test in this file
  afterEach(async () => {
    // Clean up: Delete the user we created to keep tests independent
    await db.query("DELETE FROM users WHERE email = 'testuser@example.com'");
  });

  // afterAll() runs once after all tests in this file are done
  afterAll(async () => {
    // Close the database connection pool to prevent Jest from hanging
    // You might need to export the pool from your db.js for this to work
    // e.g., module.exports = { query: ..., pool: ... }
    // await db.pool.end();
    // For now, we can skip this and address if Jest hangs
  });

  // it() or test() defines an individual test case
  it("should register a new user successfully", async () => {
    // Define the test data
    const newUser = {
      name: "Test User",
      email: "testuser@example.com",
      password: "password123",
    };

    // Make the request using supertest
    const response = await request.post("/api/auth/register").send(newUser); // .send() provides the request body

    // Assert the response (check if it's what we expect)
    expect(response.statusCode).toBe(201); // Check for a "201 Created" status
    expect(response.body.message).toBe("User registered successfully");
    expect(response.body.user).toHaveProperty("id"); // Check that the response contains a user with an id
    expect(response.body.user.email).toBe(newUser.email);
  });

  it("should fail to register a user if email is empty", async () => {
    // Define the test data
    const newUser = {
      name: "Test User",
      email: "",
      password: "password123",
    };

    // Make the request using supertest
    const response = await request.post("/api/auth/register").send(newUser); // .send() provides the request body

    // Assert the response (check if it's what we expect)
    expect(response.statusCode).toBe(400); // Check for a "400 Bad Request" status
    expect(response.body.errors[0]["email"]).toBe("Please include a valid email");
  });

  it("should fail to register a user if name is empty", async () => {
    // Define the test data
    const newUser = {
      name: "",
      email: "testuser@example.com",
      password: "password123",
    };

    // Make the request using supertest
    const response = await request.post("/api/auth/register").send(newUser); // .send() provides the request body

    // Assert the response (check if it's what we expect)
    expect(response.statusCode).toBe(400); // Check for a "400 Bad Request" status
    expect(response.body.errors[0]["name"]).toBe("Name is required");
  });

  it("should fail to register a user if password is empty", async () => {
    // Define the test data
    const newUser = {
      name: "Test User",
      email: "testuser@example.com",
      password: "",
    };

    // Make the request using supertest
    const response = await request.post("/api/auth/register").send(newUser); // .send() provides the request body

    // Assert the response (check if it's what we expect)
    expect(response.statusCode).toBe(400); // Check for a "400 Bad Request" status
    expect(response.body.errors[0]["password"]).toBe("Password must be at least 8 characters long");
  });

  it("should fail to register a user with a duplicate email", async () => {
    // Define the test data
    const newUser = {
      name: "Test User",
      email: "testuser@example.com",
      password: "password123",
    };

    let response;
    // Make the request using supertest
    response = await request.post("/api/auth/register").send(newUser); // .send() provides the request body

    // duplicate the test data
    const newUser2 = {
      name: "Test User",
      email: "testuser@example.com",
      password: "password123",
    };

    // Make the request using supertest
    response = await request.post("/api/auth/register").send(newUser2); // .send() provides the request body

    // Assert the response (check if it's what we expect)
    expect(response.statusCode).toBe(400); // Check for a "400 Bad Request" status
    expect(response.body.message).toBe("User with that email already exists");
  });
});
