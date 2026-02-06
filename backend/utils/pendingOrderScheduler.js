const Order = require("../models/Order");
const User = require("../models/User");
const sendEmail = require("./sendEmail");
const templates = require("./emailTemplates");
const { getIO } = require("./socket");

const CHECK_INTERVAL = 60 * 1000; // 1 minute
let schedulerStarted = false;     // ✅ guard

const startPendingOrderScheduler = () => {
  if (schedulerStarted) return;   // ✅ prevent duplicates
  schedulerStarted = true;

  console.log("⏳ Pending Order Scheduler started");

  setInterval(async () => {
    try {
      const io = getIO();

      // ✅ reduce DB load (only orders older than 2 mins)
      const pendingOrders = await Order.find({
        status: "PENDING",
        createdAt: { $lte: new Date(Date.now() - 2 * 60 * 1000) },
      }).populate("user", "name email");

      for (const order of pendingOrders) {
        const diffMinutes =
          (Date.now() - order.createdAt.getTime()) / 60000;

        if (diffMinutes >= 2 && !order.notified2min) {
          io.to("admin").emit("adminNotification", {
            type: "PENDING_2_MIN",
            orderId: order._id,
          });
          order.notified2min = true;
        }

        if (diffMinutes >= 5 && !order.highPriority) {
          order.highPriority = true;
          io.to("admin").emit("adminNotification", {
            type: "HIGH_PRIORITY",
            orderId: order._id,
          });
        }

        if (diffMinutes >= 10 && !order.notified10min) {
          const admins = await User.find({ role: "admin" });
          const emails = admins.map(a => a.email).join(",");

          if (emails) {
            await sendEmail(
              emails,
              "⚠️ Order Pending 10 Minutes",
              "Pending order alert",
              templates.pendingOrderReminder([order], 10)
            );
          }

          order.notified10min = true;
        }

        await order.save();
      }
    } catch (err) {
      if (err.name === "MongoNetworkError") {
        console.warn("⚠️ Mongo temporary issue, retrying...");
        return;
      }
      console.error("❌ Pending Order Scheduler Error:", err);
    }
  }, CHECK_INTERVAL);
};

module.exports = { startPendingOrderScheduler };