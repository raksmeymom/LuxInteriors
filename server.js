// server.js — Entry point
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");

const { pool, port } = require("./config/db");
const logger = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");

// ── Route imports ───────────────────────────────────────────
const productRoutes = require("./routes/productRoutes");
const contactRoutes = require("./routes/contactRoutes");
const newsletterRoutes = require("./routes/newsletterRoutes");
const authRoutes = require("./routes/authRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

// ── Security headers ────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: false, // allow inline scripts in HTML pages
    crossOriginEmbedderPolicy: false,
  }),
);

// ── CORS ────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5000",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

// ── Stripe webhook MUST receive raw body ────────────────────
// Register BEFORE express.json()
app.use("/api/payment/webhook", express.raw({ type: "application/json" }));

// ── Body parsers ────────────────────────────────────────────
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

// ── Request logger ──────────────────────────────────────────
app.use(logger);

// ── Rate limiting ───────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 20,
  message: {
    success: false,
    message: "Too many requests. Please try again in 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 120,
  message: { success: false, message: "Too many requests." },
});

app.use("/api/auth", authLimiter);
app.use("/api/", apiLimiter);

// ── Static Frontend ─────────────────────────────────────────
app.use(express.static(path.join(__dirname, "../frontend/public")));
app.use(express.static(path.join(__dirname, "../frontend/pages")));
app.use("/public", express.static(path.join(__dirname, "../frontend/public")));
app.use("/pages", express.static(path.join(__dirname, "../frontend/pages")));

// ── API Routes ──────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/admin", adminRoutes);

// ── Health check ────────────────────────────────────────────
app.get("/api/health", (req, res) =>
  res.json({
    success: true,
    status: "ok",
    timestamp: new Date().toISOString(),
  }),
);

// ── Root → index.html ───────────────────────────────────────
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/pages/index.html"));
});

// ── Error Handler ───────────────────────────────────────────
app.use(errorHandler);

app.listen(port, () => {
  console.log(`\n🪑  LuxInteriors running → http://localhost:${port}`);
  console.log(`📋  API docs        → http://localhost:${port}/api/health\n`);
});
