import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Heart, Home, Compass, Map, MessageCircle } from "lucide-react";
import { useWishlist } from "../context/WishlistContext";
import { useSettings } from "../context/SettingsContext";
import { useNavLinks } from "../context/NavLinksContext";
import "./Navbar.css";

const BOTTOM_NAV_LINKS = [
  { to: "/", label: "Home", Icon: Home },
  { to: "/destinations", label: "Trips", Icon: Compass },
  { to: "/trip-planner", label: "Planner", Icon: Map },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { count: wishlistCount } = useWishlist();
  const { settings, waLink } = useSettings();
  const { navLinks } = useNavLinks();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}>
        <div className="navbar__inner container">
          {/* Brand */}
          <Link to="/" className="navbar__brand" aria-label={settings.businessName}>
            <img src="/logo.png" alt="" className="navbar__logo-img" />
            <span className="navbar__brand-text">{settings.businessName}</span>
          </Link>

          {/* Desktop nav */}
          <nav className="navbar__nav" aria-label="Primary navigation">
            {navLinks.map((link) => (
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
              className="navbar__wishlist hide-mobile"
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
          </div>
        </div>
      </header>

      {/* Mobile bottom navigation */}
      <nav className="bottom-nav" aria-label="Mobile navigation">
        {BOTTOM_NAV_LINKS.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`bottom-nav__item ${location.pathname === link.to ? "bottom-nav__item--active" : ""}`}
            aria-current={location.pathname === link.to ? "page" : undefined}
          >
            <link.Icon size={20} strokeWidth={2} />
            <span className="bottom-nav__label">{link.label}</span>
          </Link>
        ))}

        <Link
          to="/destinations"
          className="bottom-nav__item"
          aria-label={`Wishlist (${wishlistCount})`}
        >
          <span className="bottom-nav__icon-wrap">
            <Heart
              size={20}
              strokeWidth={2}
              fill={wishlistCount > 0 ? "#f97316" : "none"}
              stroke={wishlistCount > 0 ? "#f97316" : "currentColor"}
            />
            {wishlistCount > 0 && (
              <span className="bottom-nav__badge">{wishlistCount}</span>
            )}
          </span>
          <span className="bottom-nav__label">Saved</span>
        </Link>

        <a
          href={waLink("Hi! I'm interested in booking a trip.")}
          target="_blank"
          rel="noreferrer"
          className="bottom-nav__item bottom-nav__item--cta"
        >
          <MessageCircle size={20} strokeWidth={2} />
          <span className="bottom-nav__label">Book</span>
        </a>
      </nav>

    </>
  );
}
