const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const addressController = require("../controllers/addressController");

// Get profile completion (must come before /:addressId routes)
router.get("/profile/completion", protect, addressController.getProfileCompletion);

// Get all delivery addresses
router.get("/", protect, addressController.getAddresses);

// Add a new delivery address
router.post("/", protect, addressController.addAddress);

// Update profile info
router.patch("/profile/update", protect, addressController.updateProfile);

// Set preferred address
router.patch("/:addressId/set-preferred", protect, addressController.setPreferredAddress);

// Update a delivery address
router.patch("/:addressId", protect, addressController.updateAddress);

// Delete a delivery address
router.delete("/:addressId", protect, addressController.deleteAddress);

module.exports = router;
