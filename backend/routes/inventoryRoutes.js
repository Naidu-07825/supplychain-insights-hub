const express = require("express");
const {
  createInventory,
  getInventory,
} = require("../controllers/inventoryController");

const router = express.Router();

router.post("/", createInventory);
router.get("/", getInventory);

module.exports = router;
