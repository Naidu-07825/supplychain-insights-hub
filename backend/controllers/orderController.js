const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");
const templates = require("../utils/emailTemplates");
const socketUtil = require("../utils/socket");

// Simple AI suggestion: analyze last 30 days orders for a product
const aiSuggestReorder = async (productId) => {
  const since = new Date();
  since.setDate(since.getDate() - 30);

  const orders = await Order.find({
    "items.product": productId,
    createdAt: { $gte: since },
  }).lean();

  let totalOrdered = 0;
  for (const o of orders) {
    for (const it of o.items) {
      if (it.product.toString() === productId.toString()) totalOrdered += it.quantity;
    }
  }

  // naive suggestion: at least next 30 days consumption, min 50
  const suggestion = Math.max(50, Math.ceil(totalOrdered));
  return suggestion;
};

const lowStockNotify = async (product) => {
  if (!product) return;
  if (product.quantity >= 10) return;

  const admins = await User.find({ role: "admin" }).lean();
  const hospitals = await User.find({ role: "hospital" }).lean();

  const adminEmails = admins.map((a) => a.email).join(",");
  const hospitalEmails = hospitals.map((h) => h.email).join(",");
  const subject = `⚠️ Low stock: ${product.name}`;
  const html = templates.lowStock(product);

  // send to admin and hospitals using HTML templates
  if (adminEmails) await sendEmail(adminEmails, subject, `Low stock ${product.name}`, html);
  if (hospitalEmails) await sendEmail(hospitalEmails, subject, `Low stock ${product.name}`, html);

  try {
    const io = socketUtil.getIO();
    io.emit("lowStock", { product: product._id, name: product.name, quantity: product.quantity });
    io.to("admin").emit("lowStock", { product: product._id, name: product.name, quantity: product.quantity });
    io.to("hospitals").emit("lowStock", { product: product._id, name: product.name, quantity: product.quantity });
  } catch (e) {}

  // include AI suggestion to admin
  const suggested = await aiSuggestReorder(product._id);
  const aiSubject = `AI suggestion: reorder ${product.name}`;
  const aiHtml = templates.aiSuggestion(product, suggested);
  if (adminEmails) await sendEmail(adminEmails, aiSubject, `AI suggestion for ${product.name}`, aiHtml);
};

exports.placeOrder = async (req, res) => {
  try {
    const { items, address, phone, altPhone, contactEmail, notes } = req.body;
    if (!items || !items.length) return res.status(400).json({ msg: "No items in order" });

    const orderItems = [];
    let totalPrice = 0;

    for (const it of items) {
      const prod = await Product.findById(it.product);
      if (!prod) return res.status(404).json({ msg: "Product not found" });
      
      const itemPrice = prod.price || 0;
      const subtotal = itemPrice * it.quantity;
      totalPrice += subtotal;

      orderItems.push({
        product: prod._id,
        name: prod.name,
        quantity: it.quantity,
        price: itemPrice,
        subtotal: subtotal,
      });
    }

    // Calculate discount: 10% off if order total > 3000
    let discountPercentage = 0;
    let discountAmount = 0;
    let finalAmount = totalPrice;

    if (totalPrice > 3000) {
      discountPercentage = 10;
      discountAmount = Math.round((totalPrice * discountPercentage) / 100);
      finalAmount = totalPrice - discountAmount;
    }

    const order = new Order({
      user: req.user._id,
      items: orderItems,
      address,
      phone,
      altPhone,
      contactEmail,
      notes: notes || "",
      totalPrice: totalPrice,
      discountPercentage: discountPercentage,
      discountAmount: discountAmount,
      discount: discountAmount,
      finalAmount: finalAmount,
      statusHistory: [{ status: "Pending", changedBy: req.user._id }],
    });

    await order.save();

    // notify admins (HTML template)
    const admins = await User.find({ role: "admin" }).lean();
    const adminEmails = admins.map((a) => a.email).join(",");
    if (adminEmails) {
      const subject = `New Order from ${req.user.name}`;
      const html = templates.orderPlaced(order, req.user);
      await sendEmail(adminEmails, subject, `New order ${order._id}`, html);
    }

    // emit socket event
    try {
      const io = socketUtil.getIO();
      io.to("admin").emit("ADMIN_NEW_ORDER", {
  type: "NEW_ORDER",
  message: "🆕 New order received",
  order,
});
    } catch (e) {
      // socket not initialized yet
    }

    return res.status(201).json(order);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Server error" });
  }
};

exports.getAdminOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email phone")
      .populate("items.product", "name")
      .sort({ createdAt: -1 });
    return res.json(orders);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Server error" });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const { search, status } = req.query;
    let query = { user: req.user._id };

    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    let orders = await Order.find(query).populate("items.product").sort({ createdAt: -1 });

    // Search by product name if provided
    if (search) {
      const searchLower = search.toLowerCase();
      orders = orders.filter((order) =>
        order.items.some(
          (item) =>
            item.name.toLowerCase().includes(searchLower) ||
            (item.product && item.product.name.toLowerCase().includes(searchLower))
        )
      );
    }

    return res.json(orders);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Server error" });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const order = await Order.findById(orderId).populate("user").populate("items.product");
    if (!order) return res.status(404).json({ msg: "Order not found" });

    order.status = status;
    order.statusHistory.push({ status, changedBy: req.user._id });

    // if accepted -> email hospital user
    if (status === "Accepted") {
      const html = templates.orderAccepted(order);
      await sendEmail(order.user.email, `Order ${order._id} accepted`, `Your order has been accepted.`, html);
    }

    // if delivered -> decrement product stock and check low stock
    if (status === "Delivered") {
      for (const it of order.items) {
        const prod = await Product.findById(it.product._id || it.product);
        if (!prod) continue;
        prod.quantity = Math.max(0, prod.quantity - it.quantity);
        await prod.save();
        await lowStockNotify(prod);
      }

      // Send invoice email when order is delivered
      const html = templates.orderDelivered(order, order.user);
      await sendEmail(order.user.email, `Invoice - Order ${order._id}`, `Your order has been delivered. Please find the invoice attached.`, html);
    }

    await order.save();

    // emit socket events about status change
    try {
      const io = socketUtil.getIO();
      io.emit("orderStatusChanged", order);
      // notify specific user room
      if (order.user && order.user._id) io.to(order.user._id.toString()).emit("orderUpdated", order);
    } catch (e) {}

    return res.json(order);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Server error" });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;
    if (!reason) return res.status(400).json({ msg: "Cancel reason required" });

    const order = await Order.findById(orderId).populate("user").populate("items.product");
    if (!order) return res.status(404).json({ msg: "Order not found" });

    order.status = "Cancelled";
    order.cancelReason = reason;
    order.statusHistory.push({ status: "Cancelled", note: reason, changedBy: req.user._id });
    
    // Decrease product quantities since order is cancelled
    for (const it of order.items) {
      const prod = await Product.findById(it.product._id || it.product);
      if (prod) {
        prod.quantity = Math.max(0, prod.quantity - it.quantity);
        await prod.save();
      }
    }
    
    await order.save();

    // email hospital user (html)
    const html = templates.orderCancelled(order, reason);
    await sendEmail(order.user.email, `Order ${order._id} cancelled`, `Your order was cancelled. Reason: ${reason}`, html);

    try {
      const io = socketUtil.getIO();
      io.emit("orderCancelled", order);
      if (order.user && order.user._id) io.to(order.user._id.toString()).emit("orderCancelled", order);
    } catch (e) {}

    return res.json(order);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Server error" });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findByIdAndDelete(orderId);
    if (!order) return res.status(404).json({ msg: "Order not found" });

    try {
      const io = socketUtil.getIO();
      io.emit("orderDeleted", orderId);
      io.to("admin").emit("orderDeleted", orderId);
    } catch (e) {}

    return res.json({ msg: "Order deleted successfully", orderId });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Server error" });
  }
};

// Re-order functionality - create a new order from a delivered order
exports.reorder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { address, phone, altPhone, contactEmail } = req.body;

    // Find the original order
    const originalOrder = await Order.findById(orderId).populate("items.product");
    if (!originalOrder) {
      return res.status(404).json({ msg: "Original order not found" });
    }

    // Verify the order belongs to the current user
    if (originalOrder.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ msg: "Not authorized to re-order this order" });
    }

    // Verify the order is delivered
    if (originalOrder.status !== "Delivered") {
      return res.status(400).json({ msg: "Only delivered orders can be re-ordered" });
    }

    // Create new order items from the original order
    const orderItems = [];
    let totalPrice = 0;

    for (const it of originalOrder.items) {
      const prod = await Product.findById(it.product._id || it.product);
      if (!prod) {
        return res.status(404).json({ msg: `Product ${it.name} is no longer available` });
      }

      const itemPrice = prod.price || 0;
      const subtotal = itemPrice * it.quantity;
      totalPrice += subtotal;

      orderItems.push({
        product: prod._id,
        name: prod.name,
        quantity: it.quantity,
        price: itemPrice,
        subtotal: subtotal,
      });
    }

    // Create new order with the same items
    const newOrder = new Order({
      user: req.user._id,
      items: orderItems,
      address: address || originalOrder.address,
      phone: phone || originalOrder.phone,
      altPhone: altPhone || originalOrder.altPhone,
      contactEmail: contactEmail || originalOrder.contactEmail,
      totalPrice: totalPrice,
      discount: 0,
      finalAmount: totalPrice,
      statusHistory: [{ status: "Pending", changedBy: req.user._id }],
    });

    await newOrder.save();

    // Notify admins about the new order
    const admins = await User.find({ role: "admin" }).lean();
    const adminEmails = admins.map((a) => a.email).join(",");
    if (adminEmails) {
      const subject = `New Re-order from ${req.user.name}`;
      const html = templates.orderPlaced(newOrder, req.user);
      await sendEmail(adminEmails, subject, `New re-order ${newOrder._id}`, html);
    }

    // Emit socket event
    try {
      const io = socketUtil.getIO();
      io.emit("orderPlaced", newOrder);
      io.to("admin").emit("orderPlaced", newOrder);
    } catch (e) {}

    return res.status(201).json({
      msg: "Order re-placed successfully",
      order: newOrder,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Server error" });
  }
};

// Edit order - allow editing quantity and address only for pending orders
exports.editOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { items, address, phone, altPhone, notes } = req.body;

    const order = await Order.findById(orderId).populate("user").populate("items.product");
    if (!order) return res.status(404).json({ msg: "Order not found" });

    // Verify the order belongs to the current user
    if (order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ msg: "Not authorized to edit this order" });
    }

    // Only allow editing if order is in Pending status
    if (order.status !== "Pending") {
      return res.status(400).json({ msg: "Order can only be edited when status is Pending. Once accepted, editing is disabled." });
    }

    // Update items if provided
    if (items && items.length) {
      const orderItems = [];
      let totalPrice = 0;

      for (const it of items) {
        const prod = await Product.findById(it.product);
        if (!prod) return res.status(404).json({ msg: "Product not found" });
        
        const itemPrice = prod.price || 0;
        const subtotal = itemPrice * it.quantity;
        totalPrice += subtotal;

        orderItems.push({
          product: prod._id,
          name: prod.name,
          quantity: it.quantity,
          price: itemPrice,
          subtotal: subtotal,
        });
      }

      order.items = orderItems;
      order.totalPrice = totalPrice;

      // Recalculate discount
      let discountPercentage = 0;
      let discountAmount = 0;
      let finalAmount = totalPrice;

      if (totalPrice > 3000) {
        discountPercentage = 10;
        discountAmount = Math.round((totalPrice * discountPercentage) / 100);
        finalAmount = totalPrice - discountAmount;
      }

      order.discountPercentage = discountPercentage;
      order.discountAmount = discountAmount;
      order.discount = discountAmount;
      order.finalAmount = finalAmount;
    }

    // Update delivery address if provided
    if (address) order.address = address;
    if (phone) order.phone = phone;
    if (altPhone) order.altPhone = altPhone;
    if (notes !== undefined) order.notes = notes;

    // Add status history entry for the edit
    order.statusHistory.push({ 
      status: "Pending", 
      note: "Order edited by user", 
      changedBy: req.user._id 
    });

    await order.save();

    // Notify admins about the order edit
    const admins = await User.find({ role: "admin" }).lean();
    const adminEmails = admins.map((a) => a.email).join(",");
    if (adminEmails) {
      const subject = `Order ${order.orderId} has been edited by ${req.user.name}`;
      const html = templates.orderEdited(order, req.user);
      await sendEmail(adminEmails, subject, `Order ${order._id} edited`, html);
    }

    // Emit socket event
    try {
      const io = socketUtil.getIO();
      io.emit("orderUpdated", order);
      if (order.user && order.user._id) io.to(order.user._id.toString()).emit("orderUpdated", order);
    } catch (e) {}

    return res.json(order);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Server error" });
  }
};

// Get product suggestions based on availability
exports.getSuggestedProducts = async (req, res) => {
  try {
    const { productId } = req.params;
    
    // Get the product to find similar products
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ msg: "Product not found" });

    // Find similar products: available products with similar price range
    const priceRange = product.price * 0.2; // 20% price range
    const suggestions = await Product.find({
      _id: { $ne: productId },
      quantity: { $gt: 0 }, // Only available products
      price: { 
        $gte: product.price - priceRange, 
        $lte: product.price + priceRange 
      }
    }).limit(5).lean();

    return res.json(suggestions);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Server error" });
  }
};
