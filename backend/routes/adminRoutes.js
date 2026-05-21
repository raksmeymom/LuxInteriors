const express = require("express");
const router = express.Router();
const admin = require("../controllers/adminController");
const { protect, isAdmin } = require("../middleware/auth");

// All admin routes require JWT + admin role
router.use(protect, isAdmin);

// Stats dashboard
router.get("/stats", admin.getStats);

// Orders
router.get("/orders",              admin.getAllOrders);
router.put("/orders/:id/status",   admin.updateOrderStatus);

// Products
router.get(   "/products",     admin.getAllProducts);
router.post(  "/products",     admin.addProduct);
router.put(   "/products/:id", admin.updateProduct);
router.delete("/products/:id", admin.deleteProduct);

// Contacts
router.get("/contacts",            admin.getContacts);
router.put("/contacts/:id/status", admin.updateContactStatus);

// Newsletter subscribers
router.get("/subscribers", admin.getSubscribers);

// Users
router.get("/users", admin.getUsers);

module.exports = router;
