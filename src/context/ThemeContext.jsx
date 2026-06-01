import { createContext, useContext, useState, useEffect } from "react";
import { DARK_THEME, LIGHT_THEME } from "../constants.js";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("ls_theme") || "dark"
  );

  const C = theme === "light" ? LIGHT_THEME : DARK_THEME;

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.body.style.background = C.bg;
    document.body.style.color = C.text;
  }, [theme, C.bg, C.text]);

  function toggleTheme() {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem("ls_theme", next);
      return next;
    });
  }

  return (
    <ThemeContext.Provider value={{ C, theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
