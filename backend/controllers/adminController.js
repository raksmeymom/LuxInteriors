const Order = require("../models/orderModel");
const User = require("../models/userModel");
const { pool: db } = require("../config/db");

// GET /api/admin/stats
exports.getStats = async (req, res, next) => {
  try {
    const orderStats = await Order.getStats();
    const totalUsers = await User.countUsers();
    const [[productCount]] = await db.query("SELECT COUNT(*) AS total FROM products");
    const [[contactCount]] = await db.query("SELECT COUNT(*) AS total FROM contacts WHERE status = 'new'");
    res.json({
      success: true,
      data: {
        total_revenue: orderStats.total_revenue,
        total_orders: orderStats.total_orders,
        total_users: totalUsers,
        total_products: productCount.total,
        new_inquiries: contactCount.total,
      },
    });
  } catch (err) { next(err); }
};

// GET /api/admin/orders
exports.getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.getAllOrders();
    res.json({ success: true, count: orders.length, data: orders });
  } catch (err) { next(err); }
};

// PUT /api/admin/orders/:id/status  { status }
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const validStatuses = ["pending","paid","processing","shipped","delivered","cancelled"];
    const { status } = req.body;
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status. Use: ${validStatuses.join(", ")}` });
    }
    await Order.updateStatus(req.params.id, status);
    res.json({ success: true, message: `Order #${req.params.id} marked as ${status} ✦` });
  } catch (err) { next(err); }
};

// GET /api/admin/products
exports.getAllProducts = async (req, res, next) => {
  try {
    const [rows] = await db.query("SELECT * FROM products ORDER BY id ASC");
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) { next(err); }
};

// POST /api/admin/products
exports.addProduct = async (req, res, next) => {
  try {
    const { name, category, price, rating, badge, img, description, stock } = req.body;
    if (!name || !category || !price || !img) {
      return res.status(400).json({ success: false, message: "name, category, price, img are required." });
    }
    const [result] = await db.query(
      "INSERT INTO products (name, category, price, rating, badge, img, description, stock) VALUES (?,?,?,?,?,?,?,?)",
      [name, category, price, rating || 4.5, badge || null, img, description || "", stock || 100]
    );
    const [[product]] = await db.query("SELECT * FROM products WHERE id = ?", [result.insertId]);
    res.status(201).json({ success: true, message: "Product added ✦", data: product });
  } catch (err) { next(err); }
};

// PUT /api/admin/products/:id
exports.updateProduct = async (req, res, next) => {
  try {
    const { name, category, price, rating, badge, img, description, stock } = req.body;
    await db.query(
      "UPDATE products SET name=?, category=?, price=?, rating=?, badge=?, img=?, description=?, stock=? WHERE id=?",
      [name, category, price, rating, badge || null, img, description, stock, req.params.id]
    );
    const [[product]] = await db.query("SELECT * FROM products WHERE id = ?", [req.params.id]);
    if (!product) return res.status(404).json({ success: false, message: "Product not found." });
    res.json({ success: true, message: "Product updated ✦", data: product });
  } catch (err) { next(err); }
};

// DELETE /api/admin/products/:id
exports.deleteProduct = async (req, res, next) => {
  try {
    const [[product]] = await db.query("SELECT id FROM products WHERE id = ?", [req.params.id]);
    if (!product) return res.status(404).json({ success: false, message: "Product not found." });
    await db.query("DELETE FROM products WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: `Product #${req.params.id} deleted.` });
  } catch (err) { next(err); }
};

// GET /api/admin/contacts
exports.getContacts = async (req, res, next) => {
  try {
    const [rows] = await db.query("SELECT * FROM contacts ORDER BY created_at DESC");
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) { next(err); }
};

// PUT /api/admin/contacts/:id/status  { status }
exports.updateContactStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!["new","read","replied"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status." });
    }
    await db.query("UPDATE contacts SET status = ? WHERE id = ?", [status, req.params.id]);
    res.json({ success: true, message: "Contact status updated." });
  } catch (err) { next(err); }
};

// GET /api/admin/subscribers
exports.getSubscribers = async (req, res, next) => {
  try {
    const [rows] = await db.query("SELECT * FROM newsletter ORDER BY created_at DESC");
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) { next(err); }
};

// GET /api/admin/users
exports.getUsers = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      "SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC"
    );
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) { next(err); }
};
