import { io } from "socket.io-client";
import { BACKEND_BASE_URL } from "../config/api";

let adminSocket = null;

export const getAdminSocket = ({ user, token } = {}) => {
  if (!token || !user) return null;

  const userId = user.id || user._id;
  const role = user.role || "admin";

  if (!userId) return null;

  if (!adminSocket) {
    adminSocket = io(process.env.REACT_APP_SOCKET_URL || BACKEND_BASE_URL, {
      autoConnect: false,
      path: "/socket.io",
      transports: ["websocket", "polling"],
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
