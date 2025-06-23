const { Pool } = require("pg");

// Create a new connection pool using the credentials from our .env file
// The pool will manage multiple client connections and reuse them efficiently.
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// We export a query function that executes a query on a client from the pool
// This is a simple abstraction to make querying from our routes easier
module.exports = {
  query: (text, params) => pool.query(text, params),
};
