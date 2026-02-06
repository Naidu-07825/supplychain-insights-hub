const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ChatMessage = require("../models/ChatMessage");
const { Server } = require("socket.io");
const { getBotReply } = require("./chatbot");

let io = null;

/* =========================
   ⏰ TIME-BASED GREETING
========================= */
const getTimeGreeting = () => {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) return "Good morning 👋";
  if (hour >= 12 && hour < 17) return "Good afternoon ☀️";
  return "Good evening 🌙";
};

exports.init = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PATCH"],
    },
  });

  /* =========================
     🔐 SOCKET AUTH MIDDLEWARE
  ========================= */
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next();

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");

      if (user) {
        socket.user = user;
        console.log(
          "🔐 Socket authenticated:",
          user._id.toString(),
          user.role
        );
      }

      next();
    } catch (err) {
      console.log("❌ Socket auth error:", err.message);
      next();
    }
  });

  /* =========================
     🔌 SOCKET CONNECTION
  ========================= */
  io.on("connection", (socket) => {
    console.log("🔌 Socket connected:", socket.id);

    /* =========================
       ✅ AUTO JOIN ROOMS
    ========================= */
    if (socket.user) {
      const userId = socket.user._id.toString();

      socket.join(userId);           // personal room
      socket.join(socket.user.role); // role room

      if (socket.user.role === "admin") socket.join("admin");
      if (socket.user.role === "hospital") socket.join("hospitals");

      console.log("✅ Joined rooms:", userId, socket.user.role);
    }

    /* =========================
       🤖 REQUESTED GREETING ONLY
    ========================= */
    socket.on("REQUEST_GREETING", async () => {
      if (!socket.user) return;

      const greeting = getTimeGreeting();
      const messageId = `greet-${Date.now()}`;

      // save greeting
      await ChatMessage.create({
        messageId,
        from: "bot",
        toUserId: socket.user._id,
        message: greeting,
        status: "seen",
      });

      socket.emit("CHAT_BOT_REPLY", {
        message: greeting,
        messageId,
        quickReplies: [
          { id: "order", label: "📦 Order Issue" },
          { id: "payment", label: "💳 Payment" },
          { id: "emergency", label: "🚑 Emergency" },
        ],
      });

      console.log("🤖 Greeting sent to user");
    });

    /* =========================
       ⚡ QUICK REPLY CLICK
    ========================= */
    socket.on("QUICK_REPLY_CLICK", async ({ replyId, replyLabel }) => {
      if (!socket.user) return;

      const userId = socket.user._id;

      await ChatMessage.create({
        messageId: `qr-user-${Date.now()}`,
        from: "user",
        fromUserId: userId,
        message: replyLabel,
        status: "sent",
      });

      io.to("admin").emit("CHAT_MESSAGE", {
        sender: "user",
        userId: userId.toString(),
        message: replyLabel,
        intent: replyId, // order / payment / emergency
      });
    });

    /* =========================
       💬 USER MESSAGE
    ========================= */
    socket.on("CHAT_MESSAGE", async ({ message, messageId }) => {
      if (!socket.user) return;

      const userId = socket.user._id;

      await ChatMessage.create({
        messageId,
        from: "user",
        fromUserId: userId,
        message,
        status: "sent",
      });

      io.to("admin").emit("CHAT_MESSAGE", {
        sender: "user",
        userId: userId.toString(),
        message,
        messageId,
      });

      const botReply = await getBotReply(message, userId.toString());

      if (botReply) {
        const botMessageId = `bot-${Date.now()}`;

        await ChatMessage.create({
          messageId: botMessageId,
          from: "bot",
          toUserId: userId,
          message: botReply,
          status: "seen",
        });

        io.to(userId.toString()).emit("CHAT_BOT_REPLY", {
          message: botReply,
          messageId: botMessageId,
        });
      }
    });

    /* =========================
       ✍️ TYPING INDICATORS
    ========================= */
    socket.on("USER_TYPING", () => {
      if (!socket.user) return;

      io.to("admin").emit("USER_TYPING", {
        userId: socket.user._id.toString(),
        role: socket.user.role,
      });
    });

    socket.on("USER_STOP_TYPING", () => {
      if (!socket.user) return;

      io.to("admin").emit("USER_STOP_TYPING", {
        userId: socket.user._id.toString(),
      });
    });

    /* =========================
       👨‍💼 ADMIN REPLY
    ========================= */
    socket.on("CHAT_ADMIN_REPLY", async ({ userId, message, messageId }) => {
      await ChatMessage.create({
        messageId,
        from: "admin",
        toUserId: userId,
        message,
        status: "delivered",
      });

      io.to(userId).emit("CHAT_ADMIN_REPLY", {
        sender: "admin",
        message,
        messageId,
      });
    });

    /* =========================
       👀 MESSAGE SEEN
    ========================= */
    socket.on("MESSAGE_SEEN", async ({ messageId }) => {
      await ChatMessage.findOneAndUpdate(
        { messageId },
        { status: "seen" }
      );

      io.to("admin").emit("MESSAGE_SEEN", { messageId });
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected:", socket.id);
    });
  });

  return io;
};

exports.getIO = () => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};