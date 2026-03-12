import React from "react";

const Button = ({
  children,
  onClick,
  type = "button",
  icon = null,
  variant = "primary", // primary | danger | secondary | outline
  size = "md", // sm | md | lg
  loading = false,
  disabled = false,
  fullWidth = false,
  className = "",
}) => {
  const variants = {
    primary: "bg-system-primary hover:opacity-90 text-white",

    danger: "bg-red-600 hover:bg-red-700 text-white",

    secondary: "bg-gray-600 hover:bg-gray-700 text-white",

    outline:
      "border border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800",
  };

  const sizes = {
    sm: "px-3 py-1 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-base",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2
        rounded-lg font-medium transition
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? "w-full" : ""}
        ${disabled || loading ? "opacity-60 cursor-not-allowed" : ""}
        dark:opacity-95
        ${className}
      `}
    >
      {loading ? (
        <span className="animate-pulse">Loading...</span>
      ) : (
        <>
          {icon && <span>{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};

export default Button;
