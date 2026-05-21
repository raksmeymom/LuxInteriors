const { pool: db } = require("../config/db");

// Save a contact inquiry
const saveContact = async ({ name, email, subject, message }) => {
  const [result] = await db.query(
    "INSERT INTO contacts (name, email, subject, message) VALUES (?, ?, ?, ?)",
    [name, email, subject || null, message],
  );
  return result.insertId;
};

// Save a newsletter subscriber (ignore duplicates)
const saveSubscriber = async (email) => {
  try {
    const [result] = await db.query(
      "INSERT INTO newsletter (email) VALUES (?)",
      [email],
    );
    return { inserted: true, id: result.insertId };
  } catch (err) {
    // Duplicate entry = already subscribed
    if (err.code === "ER_DUP_ENTRY") {
      return { inserted: false };
    }
    throw err;
  }
};

// Get all contacts (admin use)
const getAllContacts = async () => {
  const [rows] = await db.query(
    "SELECT * FROM contacts ORDER BY created_at DESC",
  );
  return rows;
};

module.exports = { saveContact, saveSubscriber, getAllContacts };
