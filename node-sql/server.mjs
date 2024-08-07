import express from "express";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";

const app = express();
const port = 3011;

// Middleware to parse JSON
app.use(express.json());

// Resolve the path to the database file
const dbPath = path.resolve("db", "mydatabase.db");

// Open a database connection in an async function
async function initializeDatabase() {
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  // Create a table if it does not exist
  await db.exec(
    "CREATE TABLE IF NOT EXISTS user (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT)"
  );

  return db;
}

const dbPromise = initializeDatabase();

// Endpoint to get all users
app.get("/users", async (req, res) => {
  const db = await dbPromise;
  try {
    const rows = await db.all("SELECT * FROM user");
    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Endpoint to add a new user
app.post("/users", async (req, res) => {
  const db = await dbPromise;
  const { name } = req.body;
  try {
    const result = await db.run("INSERT INTO user (name) VALUES (?)", [name]);
    res.json({ id: result.lastID, name });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Endpoint to get a user by ID
app.get("/users/:id", async (req, res) => {
  const db = await dbPromise;
  const { id } = req.params;
  try {
    const row = await db.get("SELECT * FROM user WHERE id = ?", [id]);
    res.json(row);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Endpoint to delete a user by ID
app.delete("/users/:id", async (req, res) => {
  const db = await dbPromise;
  const { id } = req.params;
  try {
    await db.run("DELETE FROM user WHERE id = ?", [id]);
    res.json({ deletedID: id });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

// this was created by ChatGPT by several prompt
