const Contact = require("../models/contactModel");

// POST /api/newsletter
exports.subscribe = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email || !email.includes("@")) {
      return res
        .status(400)
        .json({ success: false, message: "Please enter a valid email." });
    }

    const result = await Contact.saveSubscriber(email);

    if (!result.inserted) {
      return res.json({
        success: true,
        message: "You are already subscribed — thank you! ✦",
      });
    }

    res.status(201).json({
      success: true,
      message: "Welcome to the LuxInteriors family! ✦",
    });
  } catch (err) {
    next(err);
  }
};
