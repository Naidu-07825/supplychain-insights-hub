const dotenv = require("dotenv");
const connectDB = require("./config/db");
const http = require("http");

dotenv.config();

const app = require("./app");
const server = http.createServer(app);

// socket init
const socketUtil = require("./utils/socket");
socketUtil.init(server);

const { startPendingOrderScheduler } = require("./utils/pendingOrderScheduler");

const startServer = async () => {
  await connectDB();                // ✅ wait for Mongo
  startPendingOrderScheduler();     // ✅ safe to start now

  server.listen(process.env.PORT, () => {
    console.log(`🚀 Server running on port ${process.env.PORT}`);
  });
};

startServer();