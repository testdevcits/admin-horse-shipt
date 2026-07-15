import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import { LuArrowLeftFromLine, LuArrowRightFromLine } from "react-icons/lu";
import { CiCircleQuestion } from "react-icons/ci";
import { RiArrowDropUpLine, RiArrowDropDownLine } from "react-icons/ri";
import { FiMoon, FiSun } from "react-icons/fi";
import {
  BookOpen,
  Bell,
  CreditCard,
  Home,
  Leaf,
  Mail,
  ShieldCheck,
  Truck,
  UserCircle,
  Users,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import comingSoonImg from "../../assets/images/defultlogo.png";

// inside navItems array
const navItems = [
  { name: "Dashboard", path: "/dashboard", icon: <Home size={20} /> },

  {
    name: "Shippers",
    icon: <Truck size={20} />,
    subPaths: [{ name: "Shippers List", path: "/shippers" }],
  },

  {
    name: "Customers",
    icon: <Users size={20} />,
    subPaths: [{ name: "Customers List", path: "/customers" }],
  },

  {
    name: "Shipments",
    icon: <ShieldCheck size={20} />,
    subPaths: [{ name: "All Shipments", path: "/shipments" }],
  },

  {
    name: "Breed List",
    icon: <Leaf size={20} />,
    subPaths: [{ name: "Breed List", path: "/breeds" }],
  },

  {
    name: "Newsletter",
    icon: <Mail size={20} />,
    subPaths: [
      { name: "Subscribers", path: "/newsletter-subscribers" },
      // You can add more newsletter actions here later
    ],
  },

  {
    name: "Notifications",
    icon: <Bell size={20} />,
    subPaths: [{ name: "All Notifications", path: "/notifications" }],
  },

  {
    name: "Platform",
    icon: <CreditCard size={20} />,
    subPaths: [{ name: "Platform Settings", path: "/platform-settings" }],
  },

  {
    name: "Legal",
    icon: <BookOpen size={20} />,
    subPaths: [
      { name: "Privacy Policy", path: "/privacy-policy" },
      { name: "Terms & Conditions", path: "/terms-conditions" },
    ],
  },

  {
    name: "Account",
    icon: <UserCircle size={20} />,
    subPaths: [
      { name: "Admin Profile", path: "/profile" },
      { name: "Settings", path: "/settings" },
    ],
  },
];

const AdminSidebar = ({
  sidebarOpen,
  setSidebarOpen,
  mobileOpen,
  setMobileOpen,
  isDesktop,
}) => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const { darkMode, toggleTheme } = useTheme();
  const [dropdowns, setDropdowns] = useState({});
  const [helpModalOpen, setHelpModalOpen] = useState(false);

  // Auto logout on 401
  useEffect(() => {
    if (!token) return;

    const interceptor = axios.interceptors.response.use(
      (res) => res,
      async (error) => {
        if (error.response?.status === 401) {
          await logout();
          navigate("/login", { replace: true });
        }
        return Promise.reject(error);
      }
    );

    return () => axios.interceptors.response.eject(interceptor);
  }, [token, logout, navigate]);

  const toggleDropdown = (name) => {
    setDropdowns((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const sidebarWidth = sidebarOpen ? "w-64" : "w-20";

  return (
    <>
      {/* Mobile overlay */}
      {!isDesktop && mobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 "
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`
          fixed left-0 top-0 h-full z-30 bg-white dark:bg-gray-900 shadow-lg
          transition-all duration-300 flex flex-col border-r dark:border-gray-700
          ${isDesktop ? sidebarWidth : "w-64"}
          ${
            isDesktop
              ? "translate-x-0"
              : mobileOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-2 border-b dark:border-gray-700">
          <div className="flex items-center gap-2">
            <img
              src={comingSoonImg}
              alt="Logo"
              className="w-8 h-8 object-contain"
            />

            {sidebarOpen && (
              <h2 className="font-bold text-black dark:text-white">
                Horse shipt
              </h2>
            )}
          </div>

          {isDesktop ? (
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="dark:text-white"
            >
              {sidebarOpen ? <LuArrowLeftFromLine /> : <LuArrowRightFromLine />}
            </button>
          ) : (
            <button onClick={() => setMobileOpen(false)}>
              <LuArrowLeftFromLine />
            </button>
          )}
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto p-2 space-y-1 app-sidebar-scrollbar">
          {navItems.map((item) => (
            <div key={item.name}>
              {/* 🔹 NORMAL LINK */}
              {!item.subPaths && (
                <NavLink
                  to={item.path}
                  onClick={() => !isDesktop && setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded transition
                    ${
                      isActive
                        ? "bg-gray-100 dark:bg-gray-800 text-system-primary"
                        : "text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`
                  }
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                    {item.icon}
                  </span>
                  {sidebarOpen && <span>{item.name}</span>}
                </NavLink>
              )}

              {/* 🔹 DROPDOWN */}
              {item.subPaths && (
                <>
                  <button
                    onClick={() => toggleDropdown(item.name)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded
                      text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                      {item.icon}
                    </span>
                    {sidebarOpen && (
                      <span className="flex-1 text-left">{item.name}</span>
                    )}
                    {sidebarOpen &&
                      (dropdowns[item.name] ? (
                        <RiArrowDropUpLine size={22} />
                      ) : (
                        <RiArrowDropDownLine size={22} />
                      ))}
                  </button>

                  {dropdowns[item.name] && sidebarOpen && (
                    <div className="ml-8 space-y-1">
                      {item.subPaths.map((sub) => (
                        <NavLink
                          key={sub.path}
                          to={sub.path}
                          onClick={() => !isDesktop && setMobileOpen(false)}
                          className={({ isActive }) =>
                            `block px-2 py-1 rounded text-sm
                            ${
                              isActive
                                ? "bg-gray-100 dark:bg-gray-800 text-system-primary font-bold"
                                : "text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 hover:font-bold"
                            }`
                          }
                        >
                          {sub.name}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </nav>

        {/* Bottom Settings */}
        <div className="p-3 border-t dark:border-gray-700 space-y-2">
          <button
            onClick={toggleTheme}
            className="w-full min-h-10 flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-800 text-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
            {sidebarOpen && (
              <span className="text-sm font-medium">
                {darkMode ? "Light Mode" : "Dark Mode"}
              </span>
            )}
          </button>

          <button
            onClick={() => setHelpModalOpen(!helpModalOpen)}
            className="w-full min-h-10 flex justify-center py-2 rounded-md bg-gray-100 dark:bg-gray-800 dark:text-white"
          >
            <CiCircleQuestion size={20} />
          </button>

          {helpModalOpen && (
            <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded-md shadow border dark:border-gray-700">
              <div className="text-sm dark:text-white">
                <p className="font-medium">Need help?</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Contact support from your settings page.
                </p>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
