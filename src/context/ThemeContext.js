import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Default: sessionStorage se load karo, ya light mode
  const [darkMode, setDarkMode] = useState(() => {
    const storedTheme = sessionStorage.getItem("theme");
    return storedTheme === "dark";
  });

  // Theme toggle function
  const toggleTheme = () => {
    setDarkMode((prev) => {
      const newTheme = !prev;
      sessionStorage.setItem("theme", newTheme ? "dark" : "light");
      return newTheme;
    });
  };

  // Page load pe body class set karo
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
