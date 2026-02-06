import { io } from "socket.io-client";

let socket = null;

export const connectSocket = (token) => {
  if (!socket) {
    socket = io(import.meta.env.VITE_API_URL, {
      auth: {
        token: token, // ✅ use passed token
      },
    });
  }
};

export const getSocket = () => socket;