const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema(
  {
    messageId: {
      type: String,
      required: true,
      index: true,
    },

    from: {
      type: String, // user | admin | bot
      required: true,
      enum: ["user", "admin", "bot"],
    },

    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // Text message (optional when file is sent)
    message: {
      type: String,
      trim: true,
      default: "",
    },

    intent: {
  type: String, // order | payment | emergency
},

    // File attachment (optional)
    file: {
      url: {
        type: String, // /uploads/chat/abc.png
      },
      name: {
        type: String, // bill.png
      },
      type: {
        type: String, // image | pdf | doc | other
        enum: ["image", "pdf", "doc", "other"],
      },
    },

    status: {
      type: String,
      enum: ["sent", "delivered", "seen"],
      default: "sent",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ChatMessage", chatMessageSchema);