const Order = require("../models/orderModel");
const Cart = require("../models/cartModel");

// POST /api/orders  — place an order from current cart
exports.placeOrder = async (req, res, next) => {
  try {
    const { shipping } = req.body;

    if (!shipping || !shipping.name || !shipping.address || !shipping.city || !shipping.country) {
      return res.status(400).json({ success: false, message: "Complete shipping details are required." });
    }

    const cartItems = await Cart.getCart(req.user.id);
    if (!cartItems.length) {
      return res.status(400).json({ success: false, message: "Your cart is empty." });
    }

    const total = cartItems.reduce((sum, i) => sum + parseFloat(i.subtotal), 0);

    const orderId = await Order.createOrder(req.user.id, total, shipping);
    await Order.addOrderItems(
      orderId,
      cartItems.map((i) => ({
        product_id: i.product_id,
        quantity: i.quantity,
        unit_price: i.price,
      }))
    );
    await Cart.clearCart(req.user.id);

    const order = await Order.getOrderById(orderId, req.user.id);
    res.status(201).json({ success: true, message: "Order placed ✦", data: order });
  } catch (err) {
    next(err);
  }
};

// GET /api/orders — my orders
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.getOrdersByUser(req.user.id);
    res.json({ success: true, count: orders.length, data: orders });
  } catch (err) {
    next(err);
  }
};

// GET /api/orders/:id — single order (scoped to user)
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.getOrderById(req.params.id, req.user.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }
    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};
