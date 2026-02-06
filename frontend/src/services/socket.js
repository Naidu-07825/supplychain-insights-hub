import { io } from "socket.io-client";

let socket = null;

/* ============================
   CONNECT SOCKET
============================ */
export const connectSocket = (token) => {
  if (!socket) {
    socket = io("https://supplychain-insights-hub.onrender.com", {
      auth: {
        token: token, // JWT token
      },
      transports: ["websocket"],
    });
  }
};

/* ============================
   GET SOCKET INSTANCE
============================ */
export const getSocket = () => socket;

/* ============================
   OPTIONAL: DISCONNECT SOCKET
============================ */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};