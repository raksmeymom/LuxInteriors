const { pool: db } = require("../config/db");

// Create new user
const createUser = async (name, email, passwordHash, role = "customer") => {
  const [result] = await db.query(
    "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
    [name, email, passwordHash, role]
  );
  return result.insertId;
};

// Find user by email (include password hash for auth)
const findByEmail = async (email) => {
  const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
  return rows[0] || null;
};

// Find user by id (exclude password hash)
const findById = async (id) => {
  const [rows] = await db.query(
    "SELECT id, name, email, role, created_at FROM users WHERE id = ?",
    [id]
  );
  return rows[0] || null;
};

// Update user profile
const updateProfile = async (id, { name, passwordHash }) => {
  const fields = [];
  const values = [];

  if (name) {
    fields.push("name = ?");
    values.push(name);
  }
  if (passwordHash) {
    fields.push("password_hash = ?");
    values.push(passwordHash);
  }

  if (!fields.length) return false;
  values.push(id);

  await db.query(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`, values);
  return true;
};

// Count all users (admin stats)
const countUsers = async () => {
  const [rows] = await db.query("SELECT COUNT(*) AS total FROM users WHERE role = 'customer'");
  return rows[0].total;
};

module.exports = { createUser, findByEmail, findById, updateProfile, countUsers };
