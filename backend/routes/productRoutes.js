const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const { protect, isAdmin } = require("../middleware/authMiddleware");

/* =========================================
   ADMIN – ADD PRODUCT
========================================= */
router.post("/", protect, isAdmin, async (req, res) => {
  try {
    const { name, description, quantity, price } = req.body;
    console.log("Creating product with:", { name, description, quantity, price });

    if (!name || quantity === undefined) {
      return res.status(400).json({ message: "Name and quantity required" });
    }

    const product = await Product.create({
      name,
      description,
      quantity,
      price: price || 0,
      createdBy: req.user._id,
    });

    console.log("Product created:", product);
    res.status(201).json(product);
  } catch (error) {
    console.error("Product creation error:", error);
    res.status(500).json({ message: "Failed to create product" });
  }
});

/* =========================================
   GET PRODUCTS (all authenticated users)
========================================= */
router.get("/", protect, async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    console.log("Fetching products, found:", products.length);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

/* =========================================
   ADMIN – UPDATE PRODUCT
========================================= */
router.put("/:id", protect, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, quantity, price } = req.body;

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (quantity !== undefined) product.quantity = quantity;
    if (price !== undefined) product.price = price;

    await product.save();
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Failed to update product" });
  }
});

/* =========================================
   ADMIN – DELETE PRODUCT
========================================= */
router.delete("/:id", protect, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Delete request for product:", id);
    const product = await Product.findByIdAndDelete(id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    console.log("Product deleted:", id);
    res.json({ message: "Product removed" });
  } catch (error) {
    console.error("Delete product error:", error.message);
    res.status(500).json({ message: "Failed to delete product" });
  }
});

module.exports = router;

