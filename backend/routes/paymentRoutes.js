const express = require("express");
const router = express.Router();
const payment = require("../controllers/paymentController");
const { protect } = require("../middleware/auth");

// Webhook MUST use raw body — registered BEFORE express.json() in server.js
// We handle it here but the raw body parser is applied in server.js
router.post("/webhook",        payment.handleWebhook);

// Checkout session — requires auth
router.post("/create-session", protect, payment.createCheckoutSession);

module.exports = router;
