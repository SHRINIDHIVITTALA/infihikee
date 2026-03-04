import { useTheme } from "../context/ThemeContext";
import { motion } from "framer-motion";
import "./ThemeToggle.css";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      <div className="theme-toggle__track">
        <motion.div
          className="theme-toggle__thumb"
          layout
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />

        {/* Sun icon */}
        <motion.svg
          className="theme-toggle__icon theme-toggle__sun"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          animate={{
            scale: isDark ? 0.6 : 1,
            opacity: isDark ? 0.3 : 1,
            rotate: isDark ? -90 : 0,
          }}
          transition={{ duration: 0.3 }}
        >
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </motion.svg>

        {/* Moon icon */}
        <motion.svg
          className="theme-toggle__icon theme-toggle__moon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          animate={{
            scale: isDark ? 1 : 0.6,
            opacity: isDark ? 1 : 0.3,
            rotate: isDark ? 0 : 90,
          }}
          transition={{ duration: 0.3 }}
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </motion.svg>

        {/* Stars for dark mode */}
        {isDark && (
          <>
            <motion.div
              className="theme-toggle__star"
              style={{ top: "4px", right: "8px" }}
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1, 0.8, 1] }}
              transition={{ delay: 0.1, duration: 0.5 }}
            />
            <motion.div
              className="theme-toggle__star"
              style={{ top: "12px", right: "4px" }}
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1, 0.8, 1] }}
              transition={{ delay: 0.2, duration: 0.5 }}
            />
          </>
        )}
      </div>
    </button>
  );
}
