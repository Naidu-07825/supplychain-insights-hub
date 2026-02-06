const express = require("express");
const router = express.Router();
const path = require("path");
const multer = require("multer");

const ChatMessage = require("../models/ChatMessage");
const auth = require("../middleware/auth");

/* ================================
   GET CHAT MESSAGES (user ↔ admin)
================================ */
router.get("/:userId", auth, async (req, res) => {
  try {
    const messages = await ChatMessage.find({
      $or: [
        { fromUserId: req.params.userId },
        { toUserId: req.params.userId },
      ],
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    console.error("Get chat messages error:", err);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
});

/* ================================
   MULTER CONFIG (CHAT FILES)
================================ */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/chat");
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "application/pdf",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only images and PDFs are allowed"), false);
    }
  },
});

/* ================================
   UPLOAD CHAT FILE
================================ */
router.post(
  "/upload",
  auth,
  upload.single("file"),
  async (req, res) => {
    try {
      const { messageId, toUserId } = req.body;

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const fileType = req.file.mimetype.includes("pdf")
        ? "pdf"
        : "image";

      const chat = await ChatMessage.create({
        messageId,
        from: "user",
        fromUserId: req.user._id,
        toUserId,
        message: "",
        file: {
          url: `/uploads/chat/${req.file.filename}`,
          name: req.file.originalname,
          type: fileType,
        },
        status: "sent",
      });

      res.status(201).json(chat);
    } catch (err) {
      console.error("Chat file upload error:", err);
      res.status(500).json({ message: "File upload failed" });
    }
  }
);

module.exports = router;