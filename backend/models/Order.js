const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
  subtotal: { type: Number, required: true, min: 0 },
});

const statusHistorySchema = new mongoose.Schema({
  status: { type: String, required: true },
  changedAt: { type: Date, default: Date.now },
  note: { type: String },
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, unique: true, sparse: true },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: [orderItemSchema],

    address: { type: String, required: true },
    phone: { type: String, required: true },
    altPhone: { type: String },
    contactEmail: { type: String, required: true },

    paymentMode: {
      type: String,
      enum: ["COD"],
      default: "COD",
    },

    status: {
      type: String,
      enum: [
        "Pending",
        "Accepted",
        "Packed",
        "Shipped",
        "Out for Delivery",
        "Delivered",
        "Cancelled",
      ],
      default: "Pending",
    },

    statusHistory: [statusHistorySchema],

    cancelReason: { type: String },
    notes: { type: String, default: "" },

    totalPrice: { type: Number, default: 0, min: 0 },
    discountPercentage: { type: Number, default: 0, min: 0, max: 100 },
    discountAmount: { type: Number, default: 0, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    finalAmount: { type: Number, default: 0, min: 0 },

    /* 🔔 Notification flags */
    notified2min: { type: Boolean, default: false },
    notified10min: { type: Boolean, default: false },

    /* 🚨 Priority handling */
    highPriority: { type: Boolean, default: false },
  },
  {
    timestamps: true, // creates createdAt & updatedAt automatically
  }
);

/* 📌 Index createdAt for faster queries */
orderSchema.index({ createdAt: 1 });

/* 🔢 Pre-save hook to generate unique 4-digit orderId */
orderSchema.pre("save", async function () {
  if (this.isNew && !this.orderId) {
    let orderId;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 100;

    while (!isUnique && attempts < maxAttempts) {
      orderId = String(Math.floor(1000 + Math.random() * 9000));
      const existing = await this.model("Order").findOne({ orderId });
      if (!existing) isUnique = true;
      attempts++;
    }

    if (!isUnique) {
      throw new Error("Failed to generate unique order ID");
    }

    this.orderId = orderId;
  }
});

module.exports = mongoose.model("Order", orderSchema);
