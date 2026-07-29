import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { useState, useRef, useEffect } from "react";
import { CiSettings } from "react-icons/ci";
import { FiBell, FiMenu } from "react-icons/fi";
import { Link } from "react-router-dom";
import comingSoonImg from "../../assets/images/defultlogo.png";
import { useAdminNotifications } from "../../context/AdminNotificationContext";

const Header = ({ sidebarOpen, setSidebarOpen, isDesktop }) => {
  const { logout, user } = useAuth();
  const { darkMode } = useTheme();
  const { unreadCount, recentNotifications } = useAdminNotifications();

  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const tooltipRef = useRef(null);
  const notificationRef = useRef(null);

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
        setTooltipOpen(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setNotificationOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayCount = unreadCount > 99 ? "99+" : unreadCount;

  return (
    <header
      className={`shadow-sm flex justify-between items-center px-4 h-12 z-50 fixed top-0 transition-all duration-300 border-b dark:border-gray-800 ${
        darkMode ? "bg-gray-950/95 text-white" : "bg-white/95 text-dark"
      }`}
      style={{
        left: isDesktop ? (sidebarOpen ? 257 : 81) : 0,
        width: isDesktop ? `calc(100% - ${sidebarOpen ? 257 : 81}px)` : "100%",
      }}
    >
      {/* Left side */}
      <div className="flex items-center gap-2">
        {!isDesktop && (
          <button
            className={`p-2 border rounded-md transition-colors ${
              darkMode
                ? "bg-gray-800 hover:bg-gray-700 border-gray-700"
                : "bg-light hover:bg-gray-200 border-gray-300"
            }`}
            onClick={() => setSidebarOpen((prev) => !prev)}
            aria-label="Open navigation"
          >
            <FiMenu />
          </button>
        )}
        <div className="ml-1">
          <p className={`text-sm font-bold ${darkMode ? "text-white" : "text-dark"}`}>
            Welcome {user?.name || "Admin"}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
            Manage Horse Shipt operations
          </p>
        </div>
      </div>

      {/* Right side: Notifications + Avatar */}
      <div className="flex items-center gap-3">
        <div className="relative" ref={notificationRef}>
          <button
            type="button"
            className={`relative flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${
              darkMode
                ? "bg-gray-800 border-gray-700 hover:bg-gray-700"
                : "bg-white border-gray-200 text-gray-700 hover:border-[#BF9B53] hover:text-[#997C42]"
            }`}
            onClick={() => {
              setNotificationOpen((prev) => !prev);
              setTooltipOpen(false);
            }}
            aria-label="Open notifications"
          >
            <FiBell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 min-w-[18px] rounded-full bg-red-600 px-1.5 py-0.5 text-center text-[10px] font-bold leading-none text-white">
                {displayCount}
              </span>
            )}
          </button>

          {notificationOpen && (
            <div
              className={`absolute right-0 mt-2 w-80 overflow-hidden rounded-md border shadow-lg z-50 ${
                darkMode ? "bg-gray-800 text-white" : "bg-white text-dark"
              }`}
            >
              <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700">
                <p className="text-sm font-bold">Notifications</p>
                <span className="text-xs font-semibold text-[#BF9B53]">
                  {unreadCount || 0} unread
                </span>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {recentNotifications.length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm text-gray-500">
                    No notifications yet
                  </p>
                ) : (
                  recentNotifications.map((notification) => (
                    <div
                      key={notification._id}
                      className="border-b border-gray-100 px-4 py-3 last:border-b-0 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
                    >
                      <p className="text-sm font-semibold">
                        {notification.title || "Notification"}
                      </p>
                      <p className="mt-1 line-clamp-2 text-xs text-gray-500 dark:text-gray-300">
                        {notification.message || "New update received"}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <Link
                to="/notifications"
                onClick={() => setNotificationOpen(false)}
                className="block border-t border-gray-200 px-4 py-3 text-center text-sm font-bold text-[#997C42] hover:bg-[#BF9B53]/10 dark:border-gray-700 dark:text-[#E8D7AD]"
              >
                View all notifications
              </Link>
            </div>
          )}
        </div>

        <div className="relative" ref={tooltipRef}>
          <button
            className={`w-9 h-9 rounded-full flex items-center justify-center border text-sm font-bold transition-colors ${
              darkMode
                ? "bg-gray-800 border-gray-700 hover:bg-gray-700"
                : "bg-[#BF9B53]/10 border-[#BF9B53]/30 text-[#8B7138] hover:bg-[#BF9B53]/20"
            }`}
            onClick={() => setTooltipOpen((prev) => !prev)}
          >
            {user?.name?.charAt(0).toUpperCase() || "A"}
          </button>

          {/* Tooltip / Dropdown */}
          {tooltipOpen && (
            <div
              className={`absolute right-0 mt-2 w-72 rounded-md border shadow-lg overflow-hidden z-50 transition-transform transform scale-95 animate-slide-down ${
                darkMode ? "bg-gray-800 text-white" : "bg-white text-dark"
              }`}
            >
              <div className="px-4 py-3 border-b border-gray-300 dark:border-gray-700">
                <p className="font-medium">{user?.name}</p>
                <p className="text-sm opacity-80">{user?.email}</p>
                <p className="text-xs opacity-60">{user?.role}</p>
              </div>

              <div className="flex flex-col">
                <a
                  href="/settings"
                  className="flex items-center px-4 py-2 gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <CiSettings size={18} />
                  Settings
                </a>

                {/* Logout + Image same row */}
                <div className="flex items-center  px-4 gap-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <img
                    src={comingSoonImg}
                    alt="Logo"
                    className="w-6 h-6 object-contain"
                  />
                  <button onClick={logout} className="text-left">
                    Logout
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
