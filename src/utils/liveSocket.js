// src/utils/liveSocket.js
import { io } from "socket.io-client";

// ❶ Put your current ngrok URL ( *https* ) in .env
//    VITE_SOCKET_URL=https://abcd1234.ngrok-free.app
const URL = "https://37a7-69-250-230-253.ngrok-free.app" || "http://localhost:4000";

export const socket = io(URL, {
  transports: ["websocket"],   // skip long‑poll fallback
});

export default socket;
