import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle } from "lucide-react";
import { useWishlist } from "../context/WishlistContext";
import { useSettings } from "../context/SettingsContext";
import "./Navbar.css";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/destinations", label: "Destinations" },
  { to: "/trip-planner", label: "Planner" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const { count: wishlistCount } = useWishlist();
  const { waLink, settings } = useSettings();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <>
      <header className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}>
        <div className="navbar__inner container">
          {/* Brand */}
          <Link to="/" className="navbar__brand" aria-label="Infinity Hikers">
            <img src="/logo.png" alt="" className="navbar__logo-img" />
            <span className="navbar__brand-text">INFINITY HIKERS</span>
          </Link>

          {/* Desktop nav */}
          <nav className="navbar__nav" aria-label="Primary navigation">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`navbar__link ${location.pathname === link.to ? "navbar__link--active" : ""}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="navbar__actions">
            <Link
              to="/destinations"
              className="navbar__wishlist"
              aria-label={`Wishlist (${wishlistCount})`}
            >
              <Heart
                size={18}
                fill={wishlistCount > 0 ? "#f97316" : "none"}
                stroke={wishlistCount > 0 ? "#f97316" : "currentColor"}
              />
              {wishlistCount > 0 && (
                <span className="navbar__wishlist-badge">{wishlistCount}</span>
              )}
            </Link>

            <a
              href={waLink("Hi! I'm interested in booking a trip.")}
              target="_blank"
              rel="noreferrer"
              className="navbar__book hide-mobile"
            >
              Book Now
            </a>

            <button
              className="navbar__burger"
              onClick={() => setMenuOpen((p) => !p)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
            >
              <span className={`navbar__burger-bar ${menuOpen ? "navbar__burger-bar--top-open" : ""}`} />
              <span className={`navbar__burger-bar ${menuOpen ? "navbar__burger-bar--bot-open" : ""}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Full-screen drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="nav-drawer"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="nav-drawer__grain" />

            <nav className="nav-drawer__links">
              {NAV_LINKS.map((link, i) => (
                <motion.div
                  key={link.to}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.18 + i * 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Link
                    to={link.to}
                    className={`nav-drawer__link ${location.pathname === link.to ? "nav-drawer__link--active" : ""}`}
                  >
                    <span className="nav-drawer__link-num">0{i + 1}</span>
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </nav>

            <motion.div
              className="nav-drawer__footer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <a
                href={waLink("Hi! I'm interested in booking a trip.")}
                target="_blank"
                rel="noreferrer"
                className="nav-drawer__cta"
              >
                <MessageCircle size={17} />
                Book via WhatsApp
              </a>
              <p className="nav-drawer__contact">
                {settings.phone} · {settings.instagram.replace("https://www.instagram.com/", "@")}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
