require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const argon2 = require("argon2");

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

app.use(
  session({
    store: new pgSession({
      pool: pool,
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

const isLoggedIn = (req, res, next) => {
  if (req.session.user_id) {
    next();
  } else {
    res.status(401).json({ error: "You must be logged in" });
  }
};

// Authentication Endpoints
app.post("/api/signup", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required" });
  }
  try {
    const hashedPassword = await argon2.hash(password);
    const result = await pool.query(
      "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id",
      [username, hashedPassword]
    );
    req.session.user_id = result.rows[0].id;
    res.json({ success: true, user_id: result.rows[0].id });
  } catch (err) {
    if (err.code === "23505") {
      res.status(409).json({ error: "Username already exists" });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required" });
  }
  try {
    const result = await pool.query(
      "SELECT id, password FROM users WHERE username = $1",
      [username]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid username or password" });
    }
    const user = result.rows[0];
    const passwordMatch = await argon2.verify(user.password, password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid username or password" });
    }
    req.session.user_id = user.id;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/logout", (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

app.get("/api/user", (req, res) => {
  if (req.session.user_id) {
    res.json({ user_id: req.session.user_id });
  } else {
    res.json({});
  }
});

// CRUD Endpoints with Authentication
app.get("/api/todos", isLoggedIn, async (req, res) => {
  const user_id = req.session.user_id;
  try {
    const result = await pool.query("SELECT * FROM todos WHERE user_id = $1", [
      user_id,
    ]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/todos", isLoggedIn, async (req, res) => {
  const { task } = req.body;
  const user_id = req.session.user_id;
  try {
    const result = await pool.query(
      "INSERT INTO todos (task, user_id) VALUES ($1, $2) RETURNING *",
      [task, user_id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/todos/:id", isLoggedIn, async (req, res) => {
  const { id } = req.params;
  const { task, completed } = req.body;
  const user_id = req.session.user_id;
  try {
    const existing = await pool.query(
      "SELECT * FROM todos WHERE id = $1 AND user_id = $2",
      [id, user_id]
    );
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: "Todo not found" });
    }
    const currentTodo = existing.rows[0];
    const finalTask = task !== undefined ? task : currentTodo.task;
    const finalCompleted =
      completed !== undefined ? completed : currentTodo.completed;
    const result = await pool.query(
      "UPDATE todos SET task = $1, completed = $2 WHERE id = $3 AND user_id = $4 RETURNING *",
      [finalTask, finalCompleted, id, user_id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/todos/:id", isLoggedIn, async (req, res) => {
  const { id } = req.params;
  const user_id = req.session.user_id;
  try {
    await pool.query("DELETE FROM todos WHERE id = $1 AND user_id = $2", [
      id,
      user_id,
    ]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
