import { Link } from "react-router-dom";
import { Phone, Instagram, MessageCircle, ArrowRight } from "lucide-react";
import { useSettings } from "../context/SettingsContext";
import { useNavLinks } from "../context/NavLinksContext";
import "./Footer.css";

const EXPLORE_LINKS = [
  { to: "/packing-list", label: "Packing List" },
];

const COMPANY_LINKS = [
  { to: "/about", label: "About Us" },
  { to: "/faq", label: "FAQs" },
  { to: "/terms", label: "Terms & Conditions" },
  { to: "/privacy", label: "Privacy Policy" },
];

export default function Footer() {
  const { settings, waLink } = useSettings();
  const { footerLinks } = useNavLinks();
  return (
    <footer className="footer">
      <div className="footer__grain" />

      {/* Big headline section */}
      <div className="footer__headline">
        <div className="container footer__headline-inner">
          <div className="footer__headline-text">
            <span className="footer__eyebrow">Ready for your next chapter?</span>
            <h2 className="footer__big">GO. EXPLORE.<br />LIVE.</h2>
          </div>
          <a
            href={waLink("Hi! I'd love to know more about your upcoming trips.")}
            target="_blank"
            rel="noreferrer"
            className="footer__cta-btn"
          >
            <MessageCircle size={18} />
            Chat on WhatsApp
            <ArrowRight size={16} />
          </a>
        </div>
      </div>

      {/* Divider */}
      <div className="footer__rule" />

      {/* Link columns */}
      <div className="container footer__cols">
        <div className="footer__col footer__col--brand">
          <div className="footer__brand">
            <img src="/logo.png" alt={settings.businessName} className="footer__logo" />
            <span className="footer__brand-name">{settings.businessName}</span>
          </div>
          <p className="footer__desc">{settings.footerDescription}</p>
          <div className="footer__socials">
            <a href={waLink()} target="_blank" rel="noreferrer" className="footer__social" aria-label="WhatsApp">
              <MessageCircle size={15} />
            </a>
            <a href={settings.instagram} target="_blank" rel="noreferrer" className="footer__social" aria-label="Instagram">
              <Instagram size={15} />
            </a>
            <a href={`tel:${settings.phone}`} className="footer__social" aria-label="Call us">
              <Phone size={15} />
            </a>
          </div>
        </div>

        <div className="footer__col">
          <h4 className="footer__col-heading">Quick Links</h4>
          <ul className="footer__links">
            {footerLinks.map((l) => (
              <li key={l.to}>
                <Link to={l.to}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer__col">
          <h4 className="footer__col-heading">Explore</h4>
          <ul className="footer__links">
            {EXPLORE_LINKS.map((l) => (
              <li key={l.to}>
                <Link to={l.to}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer__col">
          <h4 className="footer__col-heading">Company</h4>
          <ul className="footer__links">
            {COMPANY_LINKS.map((l) => (
              <li key={l.to}>
                <Link to={l.to}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer__col">
          <h4 className="footer__col-heading">Contact</h4>
          <a href={`tel:${settings.phone}`} className="footer__contact-item">
            <Phone size={14} />
            {settings.phone}
          </a>
          <a href={settings.instagram} target="_blank" rel="noreferrer" className="footer__contact-item">
            <Instagram size={14} />
            {settings.instagram.replace("https://www.instagram.com/", "@")}
          </a>
          <a href={waLink()} target="_blank" rel="noreferrer" className="footer__contact-item">
            <MessageCircle size={14} />
            WhatsApp us
          </a>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <p className="footer__copyright">
            &copy; {new Date().getFullYear()} {settings.businessName}. All rights reserved.
          </p>
          <p className="footer__love">{settings.footerNote}</p>
        </div>
      </div>
    </footer>
  );
}
