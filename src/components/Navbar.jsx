import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Phone, Menu, X, Instagram, MessageCircle, Heart } from "lucide-react";
import { useWishlist } from "../context/WishlistContext";
import "./Navbar.css";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/destinations", label: "Destinations" },
  { to: "/trip-planner", label: "Trip Planner" },
  { to: "/map", label: "Map" },
  { to: "/community", label: "Community" },
  { to: "/sustainability", label: "Eco Travel" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const { count: wishlistCount } = useWishlist();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <>
      {/* Slim utility topbar */}
      <div className="topbar">
        <div className="topbar__inner">
          <div className="topbar__left">
            <a href="tel:+919916258596" className="topbar__link">
              <Phone size={12} />
              <span>+91 99162 58596</span>
            </a>
            <span className="topbar__sep">·</span>
            <a
              href="https://www.instagram.com/infinity.hikers"
              target="_blank"
              rel="noreferrer"
              className="topbar__link"
            >
              <Instagram size={12} />
              <span>@infinity.hikers</span>
            </a>
          </div>
          <div className="topbar__right">
            <a
              href="https://wa.me/919916258596?text=Hi! I'm interested in booking a trip with Infinity Hikers."
              target="_blank"
              rel="noreferrer"
              className="topbar__help"
            >
              <MessageCircle size={12} />
              <span>Need help?</span>
            </a>
          </div>
        </div>
      </div>

      <header className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}>
        <div className="container navbar__inner">
          {/* Brand */}
          <Link to="/" className="navbar__brand" aria-label="Infinity Hikers Home">
            <img src="/logo.png" alt="Infinity Hikers" className="navbar__logo-img" />
          </Link>

          {/* Primary nav links – center */}
          <nav
            className={`navbar__nav ${menuOpen ? "navbar__nav--open" : ""}`}
            aria-label="Primary navigation"
          >
            {NAV_LINKS.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`navbar__link ${location.pathname === link.to ? "active" : ""}`}
              >
                {link.label}
                <span className="navbar__link-indicator" />
              </Link>
            ))}

            {/* Mobile-only CTA block inside the drawer */}
            <div className="navbar__mobile-cta hide-desktop">
              <a
                href="https://wa.me/919916258596?text=Hi! I'm interested in booking a trip with Infinity Hikers."
                target="_blank"
                rel="noreferrer"
                className="navbar__btn-book"
              >
                Book Now
              </a>
            </div>
          </nav>

          {/* Right actions */}
          <div className="navbar__actions">
            {/* Wishlist heart */}
            <Link to="/destinations" className="navbar__wishlist-btn" aria-label={`Wishlist (${wishlistCount})`}>
              <Heart size={18} fill={wishlistCount > 0 ? "#f97316" : "none"} stroke={wishlistCount > 0 ? "#f97316" : "currentColor"} />
              {wishlistCount > 0 && <span className="navbar__wishlist-count">{wishlistCount}</span>}
            </Link>
            <Link to="/destinations" className="navbar__btn-book hide-mobile">
              Book Now
            </Link>
            <button
              className="navbar__burger hide-desktop"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {/* Backdrop for mobile menu */}
      {menuOpen && (
        <div className="navbar__backdrop" onClick={() => setMenuOpen(false)} />
      )}
    </>
  );
}
