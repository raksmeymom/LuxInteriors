const Cart = require("../models/cartModel");

// GET /api/cart
exports.getCart = async (req, res, next) => {
  try {
    const items = await Cart.getCart(req.user.id);
    const total = items.reduce((sum, i) => sum + parseFloat(i.subtotal), 0);
    res.json({ success: true, count: items.length, total: total.toFixed(2), data: items });
  } catch (err) {
    next(err);
  }
};

// POST /api/cart  { product_id, quantity }
exports.addToCart = async (req, res, next) => {
  try {
    const { product_id, quantity = 1 } = req.body;
    if (!product_id) {
      return res.status(400).json({ success: false, message: "product_id is required." });
    }
    if (quantity < 1) {
      return res.status(400).json({ success: false, message: "Quantity must be at least 1." });
    }
    await Cart.addItem(req.user.id, product_id, quantity);
    const items = await Cart.getCart(req.user.id);
    const total = items.reduce((sum, i) => sum + parseFloat(i.subtotal), 0);
    res.status(201).json({ success: true, message: "Added to cart ✦", count: items.length, total: total.toFixed(2), data: items });
  } catch (err) {
    next(err);
  }
};

// PUT /api/cart/:productId  { quantity }
exports.updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    if (quantity == null) {
      return res.status(400).json({ success: false, message: "quantity is required." });
    }
    await Cart.updateItem(req.user.id, req.params.productId, quantity);
    const items = await Cart.getCart(req.user.id);
    const total = items.reduce((sum, i) => sum + parseFloat(i.subtotal), 0);
    res.json({ success: true, count: items.length, total: total.toFixed(2), data: items });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/cart/:productId
exports.removeCartItem = async (req, res, next) => {
  try {
    await Cart.removeItem(req.user.id, req.params.productId);
    const items = await Cart.getCart(req.user.id);
    const total = items.reduce((sum, i) => sum + parseFloat(i.subtotal), 0);
    res.json({ success: true, message: "Item removed.", count: items.length, total: total.toFixed(2), data: items });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/cart
exports.clearCart = async (req, res, next) => {
  try {
    await Cart.clearCart(req.user.id);
    res.json({ success: true, message: "Cart cleared.", count: 0, total: "0.00", data: [] });
  } catch (err) {
    next(err);
  }
};
