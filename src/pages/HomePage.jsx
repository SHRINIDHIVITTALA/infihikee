import { useRef, useState, useCallback } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useItineraries } from "../context/ItineraryContext";
import { useWishlist } from "../context/WishlistContext";
import { useCompare } from "../context/CompareContext";
import { usePageMeta } from "../hooks/usePageMeta";
import { Heart, GitCompare, ArrowRight, Star } from "lucide-react";
import AnimatedCounter from "../components/AnimatedCounter";
import Testimonials from "../components/Testimonials";
import CinematicHero from "../components/CinematicHero";
import MarqueeTicker from "../components/MarqueeTicker";
import "./HomePage.css";

/* ─── 3D Tilt Card ──────────────────────────────────────────── */
function TripCard3D({ item, navigate, isWished, toggleWish, isComparing, toggleCompare }) {
  const cardRef = useRef(null);

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const springX = useSpring(rawX, { stiffness: 180, damping: 26 });
  const springY = useSpring(rawY, { stiffness: 180, damping: 26 });
  const rotateX = useTransform(springY, [-0.5, 0.5], ["13deg", "-13deg"]);
  const rotateY = useTransform(springX, [-0.5, 0.5], ["-13deg", "13deg"]);

  const [glare, setGlare] = useState({ x: 50, y: 50 });
  const [hovered, setHovered] = useState(false);

  const onMouseMove = useCallback(
    (e) => {
      const rect = cardRef.current?.getBoundingClientRect();
      if (!rect) return;
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      rawX.set(px);
      rawY.set(py);
      setGlare({
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100,
      });
    },
    [rawX, rawY]
  );

  const onMouseLeave = useCallback(() => {
    rawX.set(0);
    rawY.set(0);
    setHovered(false);
  }, [rawX, rawY]);

  return (
    <div className="tc-wrap">
      <motion.div
        ref={cardRef}
        className="tc"
        style={{ rotateX, rotateY }}
        animate={{
          boxShadow: hovered
            ? "0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)"
            : "0 20px 55px rgba(0,0,0,0.32)",
        }}
        transition={{ boxShadow: { duration: 0.3 } }}
        onMouseMove={onMouseMove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={onMouseLeave}
        onClick={() => navigate(`/destination/${item.id}`)}
        whileTap={{ scale: 0.985 }}
      >
        {/* Full-bleed image */}
        <motion.div
          className="tc__image"
          style={{ backgroundImage: `url(${item.image})` }}
          animate={{ scale: hovered ? 1.07 : 1 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        />

        {/* Gradient overlay */}
        <div className="tc__gradient" />

        {/* Mouse-following glare */}
        <div
          className={`tc__glare ${hovered ? "tc__glare--on" : ""}`}
          style={{
            background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.17) 0%, transparent 58%)`,
          }}
        />

        {/* Top row: badges + action buttons */}
        <div className="tc__top">
          <div className="tc__badges">
            {item.difficulty && (
              <span className="tc__badge tc__badge--diff">{item.difficulty}</span>
            )}
            {item.rating && (
              <span className="tc__badge tc__badge--rating">
                <Star size={10} fill="#fbbf24" stroke="none" />
                {item.rating}
              </span>
            )}
          </div>
          <div className="tc__actions">
            <button
              className={`tc__action ${isWished(item.id) ? "tc__action--wished" : ""}`}
              onClick={(e) => { e.stopPropagation(); toggleWish(item.id); }}
              aria-label="Save to wishlist"
            >
              <Heart
                size={14}
                fill={isWished(item.id) ? "#f97316" : "none"}
                stroke={isWished(item.id) ? "#f97316" : "#fff"}
              />
            </button>
            <button
              className={`tc__action ${isComparing(item.id) ? "tc__action--comparing" : ""}`}
              onClick={(e) => { e.stopPropagation(); toggleCompare(item.id); }}
              aria-label="Compare trip"
            >
              <GitCompare
                size={14}
                stroke={isComparing(item.id) ? "#60a5fa" : "#fff"}
              />
            </button>
          </div>
        </div>

        {/* HUGE destination name */}
        <div className="tc__dest">
          {item.destination.toUpperCase()}
        </div>

        {/* Bottom info — slides up on hover */}
        <motion.div
          className="tc__content"
          animate={{ y: hovered ? 0 : 18, opacity: hovered ? 1 : 0.72 }}
          transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="tc__meta">
            <span>{item.duration}</span>
            {item.bestSeason && <span>Best: {item.bestSeason}</span>}
          </div>
          <div className="tc__footer">
            <div className="tc__price">
              <span className="tc__price-from">From</span>
              <span className="tc__price-amt">
                ₹{item.price?.toLocaleString("en-IN")}
              </span>
            </div>
            <span className="tc__cta">Explore →</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

/* ─── Home Page ──────────────────────────────────────────────── */
export default function HomePage() {
  const { getActiveItineraries } = useItineraries();
  const itineraries = getActiveItineraries();
  const navigate = useNavigate();
  const { toggle: toggleWish, isWished } = useWishlist();
  const { toggle: toggleCompare, isComparing } = useCompare();
  usePageMeta({});

  return (
    <div className="home">
      <CinematicHero />
      <MarqueeTicker />

      {/* ── Featured Destinations ───────────────── */}
      <section className="home__trips">
        <div className="container">
          <div className="home__trips-header">
            <div>
              <span className="section-eyebrow">Curated for you</span>
              <h2 className="section-title home__trips-h2">
                Where will you<br />
                <span className="text-gradient">go next?</span>
              </h2>
            </div>
            <motion.button
              className="home__trips-viewall"
              onClick={() => navigate("/destinations")}
              whileHover={{ x: 5 }}
            >
              View all trips <ArrowRight size={16} />
            </motion.button>
          </div>

          <div className="home__trips-grid">
            {itineraries.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  delay: i * 0.09,
                  duration: 0.65,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <TripCard3D
                  item={item}
                  navigate={navigate}
                  isWished={isWished}
                  toggleWish={toggleWish}
                  isComparing={isComparing}
                  toggleCompare={toggleCompare}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats Strip ─────────────────────────── */}
      <section className="home__stats">
        <div className="container home__stats-inner">
          {[
            { target: 500, suffix: "+", label: "Happy Travelers", icon: "✈️" },
            { target: 50, suffix: "+", label: "Destinations Covered", icon: "🗺️" },
            { target: 4.9, suffix: "/5", label: "Average Rating", icon: "⭐" },
            { target: 98, suffix: "%", label: "Would Recommend", icon: "🤝" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              className="home__stat"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <span className="home__stat-icon">{stat.icon}</span>
              <div className="home__stat-num text-gradient">
                <AnimatedCounter target={stat.target} suffix={stat.suffix} />
              </div>
              <div className="home__stat-label">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Brand Story ─────────────────────────── */}
      <section className="home__story section-padding">
        <div className="container home__story-inner">
          <motion.div
            className="home__story-text"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="section-eyebrow">Our story</span>
            <h2 className="section-title">
              We don't just<br />
              book trips.<br />
              <span className="text-gradient">We craft legends.</span>
            </h2>
            <p>
              Infinity Hikers was born from one obsession: showing people that the
              world is more beautiful than they can imagine — and far more accessible
              than they think. From the misty monasteries of Bhutan to the temple
              sunsets of Bali, every journey we design is a story waiting to be lived.
            </p>
            <div className="home__story-features">
              {[
                { icon: "🌿", label: "Eco-Conscious Travel" },
                { icon: "🛡️", label: "Safety First Always" },
                { icon: "👨‍👩‍👧", label: "Family Friendly" },
                { icon: "✨", label: "All-Inclusive Packages" },
              ].map((f) => (
                <div key={f.label} className="home__story-feature">
                  <span>{f.icon}</span>
                  <span>{f.label}</span>
                </div>
              ))}
            </div>
            <button
              className="btn-primary-full"
              onClick={() => navigate("/destinations")}
            >
              Start Your Journey
              <ArrowRight size={16} style={{ marginLeft: "0.4rem" }} />
            </button>
          </motion.div>

          <motion.div
            className="home__story-visual"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="home__story-imgs">
              <div
                className="home__story-img home__story-img--back"
                style={{
                  backgroundImage:
                    "url(https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&auto=format&fit=crop&q=80)",
                }}
              />
              <div
                className="home__story-img home__story-img--mid"
                style={{
                  backgroundImage:
                    "url(https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&auto=format&fit=crop&q=80)",
                }}
              />
              <div
                className="home__story-img home__story-img--front"
                style={{
                  backgroundImage:
                    "url(https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=600&auto=format&fit=crop&q=80)",
                }}
              />
              <div className="home__story-badge">
                <span className="home__story-badge-num">482+</span>
                <span className="home__story-badge-sub">Adventures Completed</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Testimonials />

      {/* ── Final CTA ───────────────────────────── */}
      <section className="home__cta">
        <div className="home__cta-grain" />
        <div className="home__cta-orb" />
        <motion.div
          className="home__cta-content container"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <span
            className="section-eyebrow"
            style={{
              color: "#f97316",
              background: "rgba(249,115,22,0.08)",
              borderColor: "rgba(249,115,22,0.25)",
            }}
          >
            Ready?
          </span>
          <h2 className="home__cta-title">
            Your next adventure is<br />
            one message away.
          </h2>
          <p className="home__cta-sub">
            No forms, no phone queues. Just a WhatsApp message
            <br />
            and we'll take care of everything else.
          </p>
          <motion.a
            href="https://wa.me/919916258596?text=Hi! I'd love to know more about your upcoming trips."
            target="_blank"
            rel="noreferrer"
            className="home__cta-btn"
            whileHover={{ scale: 1.05, boxShadow: "0 14px 48px rgba(249,115,22,0.5)" }}
            whileTap={{ scale: 0.97 }}
          >
            <span>💬 Chat on WhatsApp</span>
            <ArrowRight size={18} />
          </motion.a>
        </motion.div>
      </section>
    </div>
  );
}
