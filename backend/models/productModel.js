const { pool: db } = require("../config/db");

// Get all products with optional filter + sort
const getAll = async ({ category, sort, search } = {}) => {
  let sql = "SELECT * FROM products WHERE 1=1";
  const params = [];

  if (category && category !== "All") {
    sql += " AND category = ?";
    params.push(category);
  }
  if (search) {
    sql += " AND (name LIKE ? OR description LIKE ? OR category LIKE ?)";
    const s = `%${search}%`;
    params.push(s, s, s);
  }

  // Support both old short codes and new frontend values
  if (sort === "price_asc" || sort === "pa") sql += " ORDER BY price ASC";
  else if (sort === "price_desc" || sort === "pd")
    sql += " ORDER BY price DESC";
  else if (sort === "rating" || sort === "r") sql += " ORDER BY rating DESC";
  else sql += " ORDER BY id ASC";

  const [rows] = await db.query(sql, params);
  return rows;
};

// Get single product by id
const getById = async (id) => {
  const [rows] = await db.query("SELECT * FROM products WHERE id = ?", [id]);
  return rows[0] || null;
};

// Get distinct categories
const getCategories = async () => {
  const [rows] = await db.query(
    "SELECT DISTINCT category FROM products ORDER BY category",
  );
  return rows.map((r) => r.category);
};

module.exports = { getAll, getById, getCategories };
