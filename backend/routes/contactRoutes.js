const express = require("express");
const router = express.Router();
const Contact = require("../models/Contact");
const { protect, isAdmin } = require("../middleware/authMiddleware");

/* =========================================
   SUBMIT CONTACT FORM (Public)
========================================= */
router.post("/", async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: "Name, email, subject, and message are required" });
    }

    const contact = await Contact.create({
      name,
      email,
      phone: phone || "",
      subject,
      message,
    });

    console.log("Contact form submitted:", { name, email, subject });
    res.status(201).json({ message: "Thank you! We will get back to you soon.", contact });
  } catch (error) {
    console.error("Contact submission error:", error);
    res.status(500).json({ message: "Failed to submit contact form" });
  }
});

/* =========================================
   GET ALL CONTACTS (Admin only)
========================================= */
router.get("/", protect, isAdmin, async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    console.log("Fetching contacts, found:", contacts.length);
    res.json(contacts);
  } catch (error) {
    console.error("Fetch contacts error:", error);
    res.status(500).json({ message: "Failed to fetch contacts" });
  }
});

/* =========================================
   UPDATE CONTACT STATUS (Admin only)
========================================= */
router.patch("/:id", protect, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["New", "Read", "Replied"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const contact = await Contact.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!contact) return res.status(404).json({ message: "Contact not found" });

    console.log("Contact status updated:", id, "->", status);
    res.json(contact);
  } catch (error) {
    console.error("Update contact error:", error);
    res.status(500).json({ message: "Failed to update contact" });
  }
});

/* =========================================
   DELETE CONTACT (Admin only)
========================================= */
router.delete("/:id", protect, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const contact = await Contact.findByIdAndDelete(id);
    if (!contact) return res.status(404).json({ message: "Contact not found" });
    console.log("Contact deleted:", id);
    res.json({ message: "Contact deleted successfully" });
  } catch (error) {
    console.error("Delete contact error:", error);
    res.status(500).json({ message: "Failed to delete contact" });
  }
});

module.exports = router;
