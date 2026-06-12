import { Link } from "react-router-dom";
import { Phone, Instagram, MessageCircle, MapPin, Compass, Users, Leaf, Mail } from "lucide-react";
import "./Footer.css";

const QUICK_LINKS = [
  { to: "/",            label: "Home" },
  { to: "/destinations",label: "Destinations" },
  { to: "/map",         label: "Explore Map" },
  { to: "/calculator",  label: "Trip Calculator" },
  { to: "/trip-planner",label: "Trip Planner" },
];

const FEATURE_LINKS = [
  { to: "/community",     label: "Community" },
  { to: "/packing-list",  label: "Packing List" },
  { to: "/sustainability", label: "Eco Travel" },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner container">
        {/* Brand */}
        <div className="footer__brand">
          <img src="/logo.png" alt="Infinity Hikers" className="footer__logo-img" />
          <p className="footer__tagline">Backpacker · Trekking · Nature Trail</p>
          <p className="footer__desc">
            Premium adventures at affordable prices — safely curated by local experts
            so you can focus on the joy of discovery.
          </p>
          <div className="footer__socials">
            <a
              href="https://wa.me/919916258596?text=Hi! I'm interested in booking a trip."
              target="_blank" rel="noreferrer"
              className="footer__social-btn footer__social-btn--wa"
              aria-label="WhatsApp"
            >
              <MessageCircle size={16} />
            </a>
            <a
              href="https://www.instagram.com/infinity.hikers"
              target="_blank" rel="noreferrer"
              className="footer__social-btn footer__social-btn--ig"
              aria-label="Instagram"
            >
              <Instagram size={16} />
            </a>
            <a
              href="tel:+919916258596"
              className="footer__social-btn footer__social-btn--ph"
              aria-label="Call us"
            >
              <Phone size={16} />
            </a>
          </div>
        </div>

        {/* Quick links */}
        <div className="footer__col">
          <h4 className="footer__col-heading">
            <Compass size={15} /> Quick Links
          </h4>
          <ul className="footer__links">
            {QUICK_LINKS.map(l => (
              <li key={l.to}><Link to={l.to}>{l.label}</Link></li>
            ))}
          </ul>
        </div>

        {/* Features */}
        <div className="footer__col">
          <h4 className="footer__col-heading">
            <Leaf size={15} /> Features
          </h4>
          <ul className="footer__links">
            {FEATURE_LINKS.map(l => (
              <li key={l.to}><Link to={l.to}>{l.label}</Link></li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div className="footer__col">
          <h4 className="footer__col-heading">
            <MapPin size={15} /> Contact Us
          </h4>
          <a href="tel:+919916258596" className="footer__contact-item">
            <Phone size={14} />
            +91 99162 58596
          </a>
          <a
            href="https://www.instagram.com/infinity.hikers"
            target="_blank" rel="noreferrer"
            className="footer__contact-item"
          >
            <Instagram size={14} />
            @infinity.hikers
          </a>
          <a
            href="https://wa.me/919916258596"
            target="_blank" rel="noreferrer"
            className="footer__whatsapp-cta"
          >
            <MessageCircle size={15} />
            Chat on WhatsApp
          </a>
        </div>
      </div>

      <div className="footer__bottom">
        <p className="footer__copyright">
          &copy; {new Date().getFullYear()} Infinity Hikers. All rights reserved.
        </p>
        <p className="footer__love">Made with ♥ for adventure lovers</p>
      </div>
    </footer>
  );
}
