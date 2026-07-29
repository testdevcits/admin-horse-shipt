import { useEffect, useState } from "react";
import Toast from "../common/Toast";
import { useAuth } from "../../context/AuthContext";
import { getAdminSocket } from "../../services/adminSocket";

const AdminRealtimeBridge = () => {
  const { user } = useAuth();
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const socket = getAdminSocket({
      user,
      token: localStorage.getItem("adminToken"),
    });

    if (!socket) return undefined;

    const handleAdminNotification = (payload) => {
      setToast({
        type: "info",
        message: payload?.message || "New admin notification received",
      });
    };

    socket.on("horse_shipt:admin_notification", handleAdminNotification);

    return () => {
      socket.off("horse_shipt:admin_notification", handleAdminNotification);
    };
  }, [user]);

  return toast ? (
    <Toast
      type={toast.type}
      message={toast.message}
      onClose={() => setToast(null)}
    />
  ) : null;
};

export default AdminRealtimeBridge;
