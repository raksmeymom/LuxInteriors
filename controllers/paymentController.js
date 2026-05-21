const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Cart = require("../models/cartModel");
const Order = require("../models/orderModel");

// POST /api/payment/create-session
// Creates a Stripe Checkout session from the user's cart
exports.createCheckoutSession = async (req, res, next) => {
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

    // Create order with pending status before redirecting to Stripe
    const orderId = await Order.createOrder(req.user.id, total, shipping);
    await Order.addOrderItems(
      orderId,
      cartItems.map((i) => ({
        product_id: i.product_id,
        quantity: i.quantity,
        unit_price: i.price,
      }))
    );

    // Build Stripe line items
    const lineItems = cartItems.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
          images: [item.img],
          description: item.category,
        },
        unit_amount: Math.round(item.price * 100), // cents
      },
      quantity: item.quantity,
    }));

    const clientUrl = process.env.CLIENT_URL || "http://localhost:5000";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: lineItems,
      customer_email: req.user.email,
      metadata: { orderId: String(orderId), userId: String(req.user.id) },
      success_url: `${clientUrl}/pages/checkout.html?success=1&order=${orderId}`,
      cancel_url:  `${clientUrl}/pages/checkout.html?cancelled=1`,
    });

    // Store session id so webhook can match it
    await Order.updateStatus(orderId, "pending"); // already pending, but set session
    const { pool: db } = require("../config/db");
    await db.query("UPDATE orders SET stripe_session_id = ? WHERE id = ?", [session.id, orderId]);

    // Clear cart after successful session creation
    await Cart.clearCart(req.user.id);

    res.json({ success: true, url: session.url, sessionId: session.id, orderId });
  } catch (err) {
    next(err);
  }
};

// POST /api/payment/webhook
// Stripe sends events here after payment
exports.handleWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body, // raw buffer (must be before express.json())
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Stripe webhook signature error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    await Order.markPaidBySession(session.id, session.payment_intent);
    console.log(`✅ Order paid — session: ${session.id}`);
  }

  res.json({ received: true });
};
