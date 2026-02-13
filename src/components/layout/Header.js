import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { useState, useRef, useEffect } from "react";
import { CiSettings } from "react-icons/ci";
import comingSoonImg from "../../assets/images/defultlogo.png";

const Header = ({ sidebarOpen, setSidebarOpen, isDesktop }) => {
  const { logout, user } = useAuth();
  const { darkMode } = useTheme();

  const [tooltipOpen, setTooltipOpen] = useState(false);
  const tooltipRef = useRef(null);

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
        setTooltipOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header
      className={`shadow flex justify-between items-center p-2 h-13 z-50 fixed top-0 transition-all duration-300  border-b dark:border-gray-700 ${
        darkMode ? "bg-gray-900 text-white" : "bg-header text-dark"
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
            className={`p-2 border rounded transition-colors ${
              darkMode
                ? "bg-gray-800 hover:bg-gray-700 border-gray-700"
                : "bg-light hover:bg-gray-200 border-gray-300"
            }`}
            onClick={() => setSidebarOpen((prev) => !prev)}
          >
            ☰
          </button>
        )}
        <span
          className={`font-medium ml-2 ${
            darkMode ? "text-white" : "text-dark"
          }`}
        >
          Welcome {user?.name || "Admin"}
        </span>
      </div>

      {/* Right side: Avatar + Tooltip */}
      <div className="relative" ref={tooltipRef}>
        <button
          className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
            darkMode
              ? "bg-gray-800 border-gray-700 hover:bg-gray-700"
              : "bg-light border-gray-300 hover:bg-gray-200"
          }`}
          onClick={() => setTooltipOpen((prev) => !prev)}
        >
          {user?.name?.charAt(0).toUpperCase() || "A"}
        </button>

        {/* Tooltip / Dropdown */}
        {tooltipOpen && (
          <div
            className={`absolute right-0 mt-2 w-70 rounded-md shadow-lg overflow-hidden z-50 transition-transform transform scale-95 animate-slide-down ${
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
    </header>
  );
};

export default Header;
