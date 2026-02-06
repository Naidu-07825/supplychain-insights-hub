const dotenv = require("dotenv");
const http = require("http");
const connectDB = require("./config/db");

// Load environment variables
dotenv.config();

// Import express app
const app = require("./app");

// ==============================
// 🩺 HEALTH CHECK ROUTE
// ==============================
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Backend is healthy 🚀",
    uptime: process.uptime(),
    timestamp: new Date(),
  });
});

// Create HTTP server
const server = http.createServer(app);

// ==============================
// 🔌 SOCKET INITIALIZATION
// ==============================
const socketUtil = require("./utils/socket");
socketUtil.init(server);

// ==============================
// ⏰ SCHEDULER
// ==============================
const {
  startPendingOrderScheduler,
} = require("./utils/pendingOrderScheduler");

// ==============================
// 🚀 START SERVER
// ==============================
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log("✅ MongoDB Connected");

    // Start scheduler AFTER DB is ready
    startPendingOrderScheduler();
    console.log("⏰ Pending Order Scheduler Started");

    // Start server
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Server startup failed:", error);
    process.exit(1);
  }
};

startServer();