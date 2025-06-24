const supertest = require("supertest");
const app = require("../app");
const db = require("../config/db");

const request = supertest(app);

// We will store the token here to use accross our tests
let token;
let testUserId;

describe("User Routes (Protected)", () => {
  // beforeAll() runs once before all tests in this file.
  // It's the perfect place to set up our test user and get a token.
  beforeAll(async () => {
    // Create a user to test with
    const testUser = {
      name: "Auth Test User",
      email: "authtest@example.com",
      password: "password123",
    };
    await request.post("/api/auth/register").send(testUser);

    // Log that user in to get a token
    const response = await request.post("/api/auth/login").send({
      email: testUser.email,
      password: testUser.password,
    });

    // Store the token and user ID for use in other tests
    token = response.body.token;

    // We need the user's ID for cleanup
    const userResult = await db.query("SELECT id FROM users WHERE email = $1", [
      testUser.email,
    ]);
    testUserId = userResult.rows[0].id;
  });

  // afterAll() runs once after all tests are done.
  // Perfect for final cleanup.
  afterAll(async () => {
    await db.query("DELETE FROM users WHERE id = $1", [testUserId]);
    // Note: In a larger test suite, you might manage transactions or
    // connect to a separate test database to avoid manual cleanup.
  });

  // --- TEST CASES ---
  it("should fetch all users for an authenticated user", async () => {
    const response = await request
      .get("/api/users")
      .set("Authorization", `Bearer ${token}`); // <-- Use the token here

    expect(response.statusCode).toBe(200);
    // The response body should be an array (of users)
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0); // Assuming db has at least our test user
  });

  it("should NOT fetch users if no token is provided", async () => {
    const response = await request.get("/api/users"); // No .set() call

    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe("No token, authorization denied");
  });

  it("should fetch the profile of the currently logged-in user", async () => {
    const response = await request
      .get("/api/users/me")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.id).toBe(testUserId);
    expect(response.body.email).toBe("authtest@example.com");
  });
});

describe("User Routes Delete Functionality (Protected)", () => {
  // beforeAll() runs once before all tests in this file.
  // It's the perfect place to set up our test user and get a token.
  beforeAll(async () => {
    // Create a user to test with
    const testUser = {
      name: "Auth Test User",
      email: "authtest@example.com",
      password: "password123",
    };
    await request.post("/api/auth/register").send(testUser);

    // Log that user in to get a token
    const response = await request.post("/api/auth/login").send({
      email: testUser.email,
      password: testUser.password,
    });

    // Store the token and user ID for use in other tests
    token = response.body.token;

    // We need the user's ID for cleanup
    const userResult = await db.query("SELECT id FROM users WHERE email = $1", [
      testUser.email,
    ]);
    testUserId = userResult.rows[0].id;
  });

  // afterAll() runs once after all tests are done.
  // Perfect for final cleanup.
  afterAll(async () => {
    await db.query("DELETE FROM users WHERE id = $1", [testUserId]);
    // Note: In a larger test suite, you might manage transactions or
    // connect to a separate test database to avoid manual cleanup.
  });

  it("should delete a user if admin", async () => {
    let deleteUser = 1;

    const response = await request
      .delete(`/api/users/${deleteUser}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(204);
  });

//   it("should fail to delete a user if not admin", async () => {
//     let deleteUser = 1;

//     const response = await request
//       .delete(`/api/users/${deleteUser}`)
//       .set("Authorization", `Bearer ${token}`);

//     expect(response.statusCode).toBe(403);
//   });
});
