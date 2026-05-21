const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/userModel");

// Helper: sign JWT
const signToken = (user) =>
  jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES || "7d" }
  );

// ── Validation rules ────────────────────────────────────────
exports.registerRules = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().normalizeEmail().withMessage("Valid email required"),
  body("password")
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
    .matches(/[A-Z]/).withMessage("Must include an uppercase letter")
    .matches(/[0-9]/).withMessage("Must include a number"),
];

exports.loginRules = [
  body("email").isEmail().normalizeEmail().withMessage("Valid email required"),
  body("password").notEmpty().withMessage("Password is required"),
];

// ── POST /api/auth/register ──────────────────────────────────
exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, password } = req.body;

    // Check duplicate
    const existing = await User.findByEmail(email);
    if (existing) {
      return res.status(409).json({ success: false, message: "Email already registered." });
    }

    const hash = await bcrypt.hash(password, 12);
    const id = await User.createUser(name, email, hash);

    const user = { id, name, email, role: "customer" };
    const token = signToken(user);

    res.status(201).json({
      success: true,
      message: `Welcome to LuxInteriors, ${name}! ✦`,
      token,
      user: { id, name, email, role: "customer" },
    });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/auth/login ─────────────────────────────────────
exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    const token = signToken(user);

    res.json({
      success: true,
      message: `Welcome back, ${user.name}! ✦`,
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/auth/me ─────────────────────────────────────────
exports.getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

// ── PUT /api/auth/me ─────────────────────────────────────────
exports.updateMe = async (req, res, next) => {
  try {
    const { name, currentPassword, newPassword } = req.body;
    const update = {};

    if (name) update.name = name;

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ success: false, message: "Current password required." });
      }
      const full = await User.findByEmail(req.user.email);
      const match = await bcrypt.compare(currentPassword, full.password_hash);
      if (!match) {
        return res.status(400).json({ success: false, message: "Current password is incorrect." });
      }
      if (newPassword.length < 8) {
        return res.status(400).json({ success: false, message: "New password must be at least 8 chars." });
      }
      update.passwordHash = await bcrypt.hash(newPassword, 12);
    }

    await User.updateProfile(req.user.id, update);
    const updated = await User.findById(req.user.id);
    res.json({ success: true, message: "Profile updated ✦", user: updated });
  } catch (err) {
    next(err);
  }
};
