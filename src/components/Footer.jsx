import { Link } from "react-router-dom";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <div className="footer__logo">
            <div className="footer__logo-icon">
              <svg viewBox="0 0 100 100" fill="none">
                <path
                  d="M50 10 L20 50 L35 50 L25 90 L80 40 L60 40 L75 10 Z"
                  fill="url(#footGrad)"
                  stroke="rgba(255,183,77,0.8)"
                  strokeWidth="1.5"
                />
                <defs>
                  <linearGradient id="footGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFB74D" />
                    <stop offset="100%" stopColor="#FF8A65" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <span className="footer__brand-name">
              <span className="accent">Infinity</span>
              <span>Hikers</span>
            </span>
          </div>
          <p className="footer__tagline">
            Backpacker &bull; Trekking &bull; Nature Trail
          </p>
          <p className="footer__desc">
            Premium service at an affordable price. Explore the world with us.
          </p>
        </div>

        <div className="footer__links">
          <h4>Quick Links</h4>
          <Link to="/">Home</Link>
          <Link to="/destinations">Destinations</Link>
          <Link to="/map">Explore Map</Link>
          <Link to="/calculator">Trip Calculator</Link>
          <Link to="/trip-planner">Trip Planner</Link>
        </div>

        <div className="footer__links">
          <h4>Features</h4>
          <Link to="/community">Community</Link>
          <Link to="/packing-list">Packing List</Link>
          <Link to="/sustainability">Sustainability</Link>
          <Link to="/admin">Admin Panel</Link>
        </div>

        <div className="footer__contact">
          <h4>Contact Us</h4>
          <a href="tel:+919916258596" className="footer__phone">
            +91 99162 58596
          </a>
          <p className="footer__social">
            <a
              href="https://www.instagram.com/infinity.hikers"
              target="_blank"
              rel="noreferrer"
            >
              @infinity.hikers
            </a>
          </p>
        </div>
      </div>
      <div className="footer__bottom">
        <p>&copy; {new Date().getFullYear()} Infinity Hikers. All rights reserved.</p>
      </div>
    </footer>
  );
}
