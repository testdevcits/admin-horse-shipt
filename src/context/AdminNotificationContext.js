import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import API from "../api/axios";
import { useAuth } from "./AuthContext";
import { getAdminSocket } from "../services/adminSocket";

const AdminNotificationContext = createContext(null);

const defaultSummary = { total: 0, unread: 0, enabled: true };

export const AdminNotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(defaultSummary);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshVersion, setRefreshVersion] = useState(0);

  const refreshSummary = useCallback(async () => {
    const token = localStorage.getItem("adminToken");
    if (!token || !user) {
      setSummary(defaultSummary);
      setRecentNotifications([]);
      return;
    }

    setLoading(true);
    try {
      const res = await API.get("/admin/notifications", {
        params: { page: 1, limit: 5 },
      });

      setSummary(res.data?.summary || defaultSummary);
      setRecentNotifications(
        Array.isArray(res.data?.data) ? res.data.data.slice(0, 5) : []
      );
    } catch (error) {
      console.error("Admin notification summary error:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const applyNotificationSnapshot = useCallback(({ summary, notifications }) => {
    if (summary) {
      setSummary(summary);
    }

    if (Array.isArray(notifications)) {
      setRecentNotifications(notifications.slice(0, 5));
    }
  }, []);

  useEffect(() => {
    refreshSummary();
  }, [refreshSummary]);

  useEffect(() => {
    const socket = getAdminSocket({
      user,
      token: localStorage.getItem("adminToken"),
    });

    if (!socket) return undefined;

    const handleAdminNotification = (payload) => {
      const newItems = Array.isArray(payload?.notifications)
        ? payload.notifications
        : [];
      const fallbackItem = newItems.length
        ? null
        : {
            _id: `${payload?.event || "notification"}-${payload?.createdAt || Date.now()}`,
            title: payload?.title || "Notification",
            message: payload?.message || "New admin notification received",
            event: payload?.event,
            type: payload?.type,
            read: false,
            createdAt: payload?.createdAt || new Date().toISOString(),
          };
      const itemsToAdd = newItems.length ? newItems : [fallbackItem];

      setSummary((prev) => ({
        ...prev,
        enabled: true,
        total: (prev.total || 0) + itemsToAdd.length,
        unread: (prev.unread || 0) + itemsToAdd.length,
      }));
      setRecentNotifications((prev) => [...itemsToAdd, ...prev].slice(0, 5));
      setRefreshVersion((version) => version + 1);
      refreshSummary();
    };

    socket.on("horse_shipt:admin_notification", handleAdminNotification);

    return () => {
      socket.off("horse_shipt:admin_notification", handleAdminNotification);
    };
  }, [refreshSummary, user]);

  const value = useMemo(
    () => ({
      summary,
      unreadCount: summary.unread || 0,
      recentNotifications,
      loading,
      refreshVersion,
      refreshSummary,
      applyNotificationSnapshot,
    }),
    [
      summary,
      recentNotifications,
      loading,
      refreshVersion,
      refreshSummary,
      applyNotificationSnapshot,
    ]
  );

  return (
    <AdminNotificationContext.Provider value={value}>
      {children}
    </AdminNotificationContext.Provider>
  );
};

export const useAdminNotifications = () => {
  const context = useContext(AdminNotificationContext);
  if (!context) {
    throw new Error(
      "useAdminNotifications must be used inside AdminNotificationProvider"
    );
  }
  return context;
};
