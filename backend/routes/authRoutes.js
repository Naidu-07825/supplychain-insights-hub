const express = require("express");
const router = express.Router();

const {
  register,
  verifyOtp,
  resendOtp,
  login,
} = require("../controllers/authController");

const User = require("../models/User");

// 🔐 Middleware
const { protect, isAdmin } = require("../middleware/authMiddleware");

/* =====================================================
   AUTH ROUTES
===================================================== */

router.post("/register", register);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.post("/login", login);

// 👤 Get current user profile
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "-password -otp -otpExpires"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const profileCompletion = user.getProfileCompletion();

    res.json({
      user,
      profileCompletion,
    });
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({ message: "Failed to fetch user profile" });
  }
});

/* =====================================================
   ADMIN-ONLY ROUTES
===================================================== */

// 👀 Get all hospital users
router.get("/hospitals", protect, isAdmin, async (req, res) => {
  try {
    const hospitals = await User.find({ role: "hospital" })
      .select("-password -otp -otpExpires");

    res.json(hospitals);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch hospitals" });
  }
});

// 🔁 Approve / Block hospital
router.patch("/hospital/:id/status", protect, isAdmin, async (req, res) => {
  try {
    const hospital = await User.findById(req.params.id);

    if (!hospital || hospital.role !== "hospital") {
      return res.status(404).json({ message: "Hospital not found" });
    }

    hospital.status =
      hospital.status === "approved" ? "blocked" : "approved";

    await hospital.save();

    res.json({
      message: "Hospital status updated",
      status: hospital.status,
    });
  } catch (error) {
    res.status(500).json({ message: "Status update failed" });
  }
});

module.exports = router;
