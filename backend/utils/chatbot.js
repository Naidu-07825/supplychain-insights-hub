// utils/chatbot.js
const Order = require("../models/Order");

const getBotReply = async (message, userId) => {
  const msg = message.toLowerCase();

  // greeting
  if (msg.includes("hi") || msg.includes("hello")) {
    return "👋 Hello! How can I help you today?";
  }

  // order status
  if (msg.includes("order status") || msg.includes("my order")) {
    const order = await Order.findOne({ user: userId }).sort({ createdAt: -1 });
    if (!order) return "📦 I couldn't find any recent orders.";
    return `📦 Your latest order is currently *${order.status}*.`;
  }

  // delivery ETA
  if (msg.includes("delivery") || msg.includes("when")) {
    return "🚚 Your order will be delivered within 24 hours after acceptance.";
  }

  // cancel
  if (msg.includes("cancel")) {
    return "❌ You can cancel the order only before it is accepted by admin.";
  }

  // fallback
  return null; // means admin help needed
};

module.exports = { getBotReply };