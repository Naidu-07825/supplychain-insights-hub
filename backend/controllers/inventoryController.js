const Inventory = require("../models/Inventory");

// auto status logic
const getStatus = (quantity, reorderLevel) => {
  if (quantity <= reorderLevel / 2) return "CRITICAL";
  if (quantity <= reorderLevel) return "LOW";
  return "OK";
};

// CREATE inventory item
exports.createInventory = async (req, res) => {
  try {
    const { quantity, reorderLevel } = req.body;

    const status = getStatus(quantity, reorderLevel);

    const item = await Inventory.create({
      ...req.body,
      status,
    });

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET all inventory
exports.getInventory = async (req, res) => {
  try {
    const inventory = await Inventory.find().populate("supplier");
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
