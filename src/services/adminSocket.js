import { io } from "socket.io-client";
import { BACKEND_BASE_URL } from "../config/api";

let adminSocket = null;
const SOCKET_PATH = process.env.REACT_APP_SOCKET_PATH || "/socket.io";
const SOCKET_TRANSPORTS = (
  process.env.REACT_APP_SOCKET_TRANSPORTS || "polling,websocket"
)
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);

export const getAdminSocket = ({ user, token } = {}) => {
  if (!token || !user) return null;

  const userId = user.id || user._id;
  const role = user.role || "admin";

  if (!userId) return null;

  if (!adminSocket) {
    adminSocket = io(process.env.REACT_APP_SOCKET_URL || BACKEND_BASE_URL, {
      autoConnect: false,
      path: SOCKET_PATH,
      transports: SOCKET_TRANSPORTS,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });

    adminSocket.on("connect", () => {
      adminSocket.emit("horse_shipt:join_admin_room");
    });
  }

  adminSocket.auth = { userId, role, token };

  if (!adminSocket.connected) {
    adminSocket.connect();
  } else {
    adminSocket.emit("horse_shipt:join_admin_room");
  }

  return adminSocket;
};

export const disconnectAdminSocket = () => {
  if (!adminSocket) return;
  adminSocket.disconnect();
};
