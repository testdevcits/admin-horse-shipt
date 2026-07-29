import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import API from "../api/axios";
import { useAuth } from "./AuthContext";
import { getAdminSocket } from "../services/adminSocket";

const AdminNotificationContext = createContext(null);

const defaultSummary = { total: 0, unread: 0, enabled: true };
const notificationPollMs = Number(
  process.env.REACT_APP_ADMIN_NOTIFICATION_POLL_MS || 0
);

export const AdminNotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(defaultSummary);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const refreshTimerRef = useRef(null);

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
    if (!user || !notificationPollMs) return undefined;

    const intervalId = setInterval(refreshSummary, notificationPollMs);
    return () => clearInterval(intervalId);
  }, [refreshSummary, user]);

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
      const currentUserId = user?._id || user?.id;
      const currentUserItems = currentUserId
        ? newItems.filter((item) => {
            const itemUser = item?.user?._id || item?.user;
            return itemUser?.toString?.() === currentUserId.toString();
          })
        : newItems;
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
      const itemsToAdd = currentUserItems.length
        ? currentUserItems
        : fallbackItem
        ? [fallbackItem]
        : [];

      if (itemsToAdd.length) {
        setSummary((prev) => ({
          ...prev,
          enabled: true,
          total: (prev.total || 0) + itemsToAdd.length,
          unread: (prev.unread || 0) + itemsToAdd.length,
        }));
        setRecentNotifications((prev) => [...itemsToAdd, ...prev].slice(0, 5));
      }
      setRefreshVersion((version) => version + 1);

      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = setTimeout(refreshSummary, 300);
    };

    const handleSocketReady = () => {
      socket.emit("horse_shipt:join_admin_room");
      refreshSummary();
    };

    socket.on("connect", handleSocketReady);
    socket.on("reconnect", handleSocketReady);
    socket.on("horse_shipt:admin_notification", handleAdminNotification);

    if (socket.connected) {
      handleSocketReady();
    }

    return () => {
      clearTimeout(refreshTimerRef.current);
      socket.off("connect", handleSocketReady);
      socket.off("reconnect", handleSocketReady);
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
