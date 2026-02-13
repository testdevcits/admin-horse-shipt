import React, { useEffect, useState } from "react";
import { useTheme } from "../../context/ThemeContext"; // Theme context

const Toast = ({ message, type = "info", duration = 3000, onClose }) => {
  const [show, setShow] = useState(true);
  const [leaving, setLeaving] = useState(false);
  const { darkMode } = useTheme(); // Theme hook

  useEffect(() => {
    const timer = setTimeout(() => {
      setLeaving(true);
      setTimeout(() => {
        setShow(false);
        onClose && onClose();
      }, 300); // matches slide-out duration
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!show) return null;

  // Light mode colors
  const lightColors = {
    info: "bg-[#BF9B53]",
    success: "bg-green-500",
    warning: "bg-yellow-500",
    error: "bg-red-500",
  };

  // Dark mode colors (slightly darker shades)
  const darkColors = {
    info: "bg-yellow-800",
    success: "bg-green-700",
    warning: "bg-yellow-600",
    error: "bg-red-700",
  };

  const bgColor = darkMode ? darkColors[type] : lightColors[type];
  const textColor = "text-white";

  return (
    <div
      className={`fixed top-4 right-4 sm:top-5 sm:right-5 z-[9999] max-w-xs w-[90%] sm:w-auto px-4 py-2 rounded-md ${bgColor} ${textColor} shadow-lg break-words ${
        leaving ? "animate-slide-up" : "animate-slide-down"
      }`}
    >
      <div className="flex justify-between items-center">
        <span className="text-sm sm:text-base">{message}</span>
        <button
          onClick={() => setLeaving(true)}
          className="ml-2 text-white font-bold px-2 py-1 rounded hover:bg-white/20 transition-colors"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default Toast;
