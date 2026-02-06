const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
  {
    itemName: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      default: "General",
    },
    quantity: {
      type: Number,
      required: true,
    },
    reorderLevel: {
      type: Number,
      default: 10,
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
    },
    status: {
      type: String,
      enum: ["OK", "LOW", "CRITICAL"],
      default: "OK",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Inventory", inventorySchema);
