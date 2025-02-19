require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

// CRUD Endpoints
app.get("/api/todos", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM todos");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/todos", async (req, res) => {
  const { task } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO todos (task) VALUES ($1) RETURNING *",
      [task]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/todos/:id", async (req, res) => {
  const { id } = req.params;
  const { task, completed } = req.body;

  try {
    // Get existing todo first
    const existing = await pool.query("SELECT * FROM todos WHERE id = $1", [
      id,
    ]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: "Todo not found" });
    }

    const currentTodo = existing.rows[0];
    const finalTask = task !== undefined ? task : currentTodo.task;
    const finalCompleted =
      completed !== undefined ? completed : currentTodo.completed;

    const result = await pool.query(
      "UPDATE todos SET task = $1, completed = $2 WHERE id = $3 RETURNING *",
      [finalTask, finalCompleted, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/todos/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM todos WHERE id = $1", [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
