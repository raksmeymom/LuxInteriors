const Contact = require("../models/contactModel");

// POST /api/contact
exports.submitContact = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, email and message are required.",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email address." });
    }

    await Contact.saveContact({ name, email, subject, message });

    res.status(201).json({
      success: true,
      message: `Thank you, ${name}! We'll be in touch within 24 hours. ✦`,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/contact  (admin — view all inquiries)
exports.getAllContacts = async (req, res, next) => {
  try {
    const contacts = await Contact.getAllContacts();
    res.json({ success: true, count: contacts.length, data: contacts });
  } catch (err) {
    next(err);
  }
};
