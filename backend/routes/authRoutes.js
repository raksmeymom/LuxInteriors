const express = require("express");
const router = express.Router();
const auth = require("../controllers/authController");
const { protect } = require("../middleware/auth");

router.post("/register", auth.registerRules, auth.register);
router.post("/login",    auth.loginRules,    auth.login);
router.get( "/me",       protect,            auth.getMe);
router.put( "/me",       protect,            auth.updateMe);

module.exports = router;
