const { pool: db } = require("../config/db");

// Get full cart for a user (JOIN products)
const getCart = async (userId) => {
  const [rows] = await db.query(
    `SELECT
       ci.product_id,
       ci.quantity,
       p.name,
       p.price,
       p.img,
       p.category,
       p.stock,
       (ci.quantity * p.price) AS subtotal
     FROM cart_items ci
     JOIN products p ON p.id = ci.product_id
     WHERE ci.user_id = ?
     ORDER BY ci.added_at ASC`,
    [userId]
  );
  return rows;
};

// Add item (or bump quantity if already in cart)
const addItem = async (userId, productId, quantity = 1) => {
  await db.query(
    `INSERT INTO cart_items (user_id, product_id, quantity)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)`,
    [userId, productId, quantity]
  );
};

// Set exact quantity
const updateItem = async (userId, productId, quantity) => {
  if (quantity <= 0) {
    return removeItem(userId, productId);
  }
  await db.query(
    "UPDATE cart_items SET quantity = ? WHERE user_id = ? AND product_id = ?",
    [quantity, userId, productId]
  );
};

// Remove single item
const removeItem = async (userId, productId) => {
  await db.query(
    "DELETE FROM cart_items WHERE user_id = ? AND product_id = ?",
    [userId, productId]
  );
};

// Clear entire cart
const clearCart = async (userId) => {
  await db.query("DELETE FROM cart_items WHERE user_id = ?", [userId]);
};

module.exports = { getCart, addItem, updateItem, removeItem, clearCart };
