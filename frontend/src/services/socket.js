import { io } from "socket.io-client";

let socket;

export const connectSocket = (token) => {
  socket = io("https://YOUR-BACKEND.onrender.com", {
    auth: { token },
    transports: ["websocket"],
  });
};

export const getSocket = () => socket;