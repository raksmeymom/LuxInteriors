const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  database: process.env.DB_NAME || "luxinteriors",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true,
});

pool
  .getConnection()
  .then(async (conn) => {
    console.log("✅ MySQL connected successfully");
    try {
      const initSQL = fs.readFileSync(path.join(__dirname, "init.sql"), "utf8");
      await conn.query(initSQL);
      console.log("✅ Database schema initialized");
    } catch (err) {
      if (err.code !== "ER_TABLE_EXISTS_ERROR") {
        console.error("❌ Schema init error:", err.message);
      }
    } finally {
      conn.release();
    }
  })
  .catch((err) => {
    console.error("❌ MySQL connection failed:", err.message);
  });

module.exports = { pool, port: process.env.PORT || 5000 };
