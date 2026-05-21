const express = require("express");
const router = express.Router();
const order = require("../controllers/orderController");
const { protect } = require("../middleware/auth");

router.use(protect); // all order routes require auth

router.post("/",    order.placeOrder);
router.get( "/",    order.getMyOrders);
router.get( "/:id", order.getOrderById);

module.exports = router;
