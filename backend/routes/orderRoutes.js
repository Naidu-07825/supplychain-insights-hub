const express = require("express");
const router = express.Router();
const { protect, isAdmin } = require("../middleware/authMiddleware");
const orderController = require("../controllers/orderController");

// Place order (hospital user)
router.post("/", protect, orderController.placeOrder);

// Hospital user: my orders (with search and filter)
router.get("/me", protect, orderController.getUserOrders);

// Hospital user: edit order (only when pending)
router.patch("/:orderId/edit", protect, orderController.editOrder);

// Hospital user: get product suggestions
router.get("/suggestions/:productId", protect, orderController.getSuggestedProducts);

// Re-order a delivered order
router.post("/:orderId/reorder", protect, orderController.reorder);

// Admin: all orders
router.get("/admin", protect, isAdmin, orderController.getAdminOrders);

// Admin: update status
router.patch("/:orderId/status", protect, isAdmin, orderController.updateOrderStatus);

// Admin: cancel with reason
router.post("/:orderId/cancel", protect, isAdmin, orderController.cancelOrder);

// Admin: delete order
router.delete("/:orderId", protect, isAdmin, orderController.deleteOrder);

module.exports = router;

