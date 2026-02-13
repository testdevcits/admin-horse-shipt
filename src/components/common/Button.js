import React from "react";

const Button = ({
  children,
  onClick,
  type = "button",
  icon = null,
  variant = "primary", // primary | danger | secondary | outline
  size = "md", // sm | md | lg
  className = "",
}) => {
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
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
      className={`
        inline-flex items-center gap-2
        rounded-md font-medium transition
        ${variants[variant]}
        ${sizes[size]}
        dark:opacity-90
        ${className}
      `}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
};

export default Button;
