import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "./ThemeToggle";
import "./Navbar.css";

const NAV_LINKS = [
  { to: "/", label: "Home", exact: true },
  { to: "/destinations", label: "Destinations" },
  { to: "/trip-planner", label: "Trip Planner" },
  { to: "/community", label: "Community" },
  { to: "/map", label: "Explore Map" },
  { to: "/calculator", label: "Trip Calculator" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const touchStartX = useRef(null);
  const navRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  // Lock body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  // Swipe-to-close gesture
  const handleTouchStart = useCallback((e) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback((e) => {
    if (touchStartX.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (diff > 60) setMenuOpen(false); // swipe right to close
    touchStartX.current = null;
  }, []);

  const isHome = location.pathname === "/";

  return (
    <motion.header
      className={`navbar ${scrolled ? "navbar--scrolled" : ""} ${isHome ? "navbar--hero" : ""}`}
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="navbar__inner">
        <Link to="/" className="navbar__brand">
          <div className="navbar__logo-icon">
            <svg viewBox="0 0 100 100" fill="none">
              <path
                d="M50 10 L20 50 L35 50 L25 90 L80 40 L60 40 L75 10 Z"
                fill="url(#navGrad)"
                stroke="rgba(255,183,77,0.8)"
                strokeWidth="1.5"
              />
              <defs>
                <linearGradient id="navGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFB74D" />
                  <stop offset="100%" stopColor="#FF8A65" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className="navbar__brand-text">
            <span className="navbar__brand-infinity">Infinity</span>
            <span className="navbar__brand-hikers">Hikers</span>
          </span>
        </Link>

        <nav
          ref={navRef}
          className={`navbar__nav ${menuOpen ? "navbar__nav--open" : ""}`}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {NAV_LINKS.map((link) => {
            const isActive = link.exact
              ? location.pathname === link.to
              : location.pathname.startsWith(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`navbar__link ${isActive ? "navbar__link--active" : ""}`}
              >
                {link.label}
                {isActive && (
                  <motion.span
                    className="navbar__link-indicator"
                    layoutId="nav-indicator"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
          <Link to="/destinations" className="navbar__cta">
            <span className="navbar__cta-text">Book Now</span>
            <span className="navbar__cta-shimmer" />
          </Link>
        </nav>

        <div className="navbar__actions">
          <ThemeToggle />
          <button
            className={`navbar__burger ${menuOpen ? "navbar__burger--open" : ""}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      {/* Mobile backdrop overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="navbar__backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setMenuOpen(false)}
          />
        )}
      </AnimatePresence>
    </motion.header>
  );
}
