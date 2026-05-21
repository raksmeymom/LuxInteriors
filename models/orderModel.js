const { pool: db } = require("../config/db");

// Create an order and return its id
const createOrder = async (userId, total, shipping, stripeSessionId = null) => {
  const [result] = await db.query(
    `INSERT INTO orders
       (user_id, total, status, stripe_session_id,
        shipping_name, shipping_address, shipping_city, shipping_country, shipping_zip)
     VALUES (?, ?, 'pending', ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      total,
      stripeSessionId,
      shipping.name,
      shipping.address,
      shipping.city,
      shipping.country,
      shipping.zip,
    ]
  );
  return result.insertId;
};

// Bulk-insert order line items
const addOrderItems = async (orderId, items) => {
  const values = items.map((i) => [orderId, i.product_id, i.quantity, i.unit_price]);
  await db.query(
    "INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES ?",
    [values]
  );
};

// All orders for a specific user (newest first)
const getOrdersByUser = async (userId) => {
  const [rows] = await db.query(
    `SELECT o.*,
       JSON_ARRAYAGG(
         JSON_OBJECT(
           'product_id', oi.product_id,
           'name',       p.name,
           'img',        p.img,
           'quantity',   oi.quantity,
           'unit_price', oi.unit_price
         )
       ) AS items
     FROM orders o
     LEFT JOIN order_items oi ON oi.order_id = o.id
     LEFT JOIN products p      ON p.id = oi.product_id
     WHERE o.user_id = ?
     GROUP BY o.id
     ORDER BY o.created_at DESC`,
    [userId]
  );
  return rows;
};

// Single order by id — scoped to user (or admin passes null for user_id)
const getOrderById = async (orderId, userId = null) => {
  let sql = `SELECT o.*,
       JSON_ARRAYAGG(
         JSON_OBJECT(
           'product_id', oi.product_id,
           'name',       p.name,
           'img',        p.img,
           'quantity',   oi.quantity,
           'unit_price', oi.unit_price
         )
       ) AS items
     FROM orders o
     LEFT JOIN order_items oi ON oi.order_id = o.id
     LEFT JOIN products p      ON p.id = oi.product_id
     WHERE o.id = ?`;
  const params = [orderId];
  if (userId) {
    sql += " AND o.user_id = ?";
    params.push(userId);
  }
  sql += " GROUP BY o.id";

  const [rows] = await db.query(sql, params);
  return rows[0] || null;
};

// Admin: all orders
const getAllOrders = async () => {
  const [rows] = await db.query(
    `SELECT o.*, u.name AS customer_name, u.email AS customer_email,
       COUNT(oi.id) AS item_count
     FROM orders o
     JOIN users u       ON u.id = o.user_id
     LEFT JOIN order_items oi ON oi.order_id = o.id
     GROUP BY o.id
     ORDER BY o.created_at DESC`
  );
  return rows;
};

// Admin: update order status
const updateStatus = async (orderId, status) => {
  await db.query("UPDATE orders SET status = ? WHERE id = ?", [status, orderId]);
};

// Mark order paid by Stripe session id
const markPaidBySession = async (sessionId, paymentIntentId) => {
  await db.query(
    "UPDATE orders SET status = 'paid', stripe_payment_id = ? WHERE stripe_session_id = ?",
    [paymentIntentId, sessionId]
  );
};

// Admin stats: total revenue, total orders
const getStats = async () => {
  const [[revenue]] = await db.query(
    "SELECT COALESCE(SUM(total),0) AS total_revenue, COUNT(*) AS total_orders FROM orders WHERE status != 'cancelled'"
  );
  return revenue;
};

module.exports = {
  createOrder,
  addOrderItems,
  getOrdersByUser,
  getOrderById,
  getAllOrders,
  updateStatus,
  markPaidBySession,
  getStats,
};
