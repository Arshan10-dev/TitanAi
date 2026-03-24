import { createContext, useState } from "react";

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [dark, setDark] = useState(true);

  const theme = {
    background: dark ? "#0f172a" : "#f8fafc",
    userBubble: dark ? "#2563eb" : "#3b82f6",
    aiBubble: dark ? "#1e293b" : "#e5e7eb",
    text: dark ? "#ffffff" : "#000000",
  };

  return (
    <ThemeContext.Provider value={{ dark, setDark, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};
