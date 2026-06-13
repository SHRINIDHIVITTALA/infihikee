import { useState, useEffect, useRef, useCallback } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { useNavigate } from "react-router-dom";
import "./CinematicHero.css";

const SLIDES = [
  {
    id: "bali-may-2026",
    dest: "BALI",
    country: "Indonesia",
    tagline: "Where gods surf & time forgets itself",
    image:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1920&auto=format&fit=crop&q=85",
  },
  {
    id: "bhutan-apr-2026",
    dest: "BHUTAN",
    country: "Kingdom of the Thunder Dragon",
    tagline: "The last Shangri-La on Earth",
    image:
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1920&auto=format&fit=crop&q=85",
  },
  {
    id: "vietnam-apr-2026",
    dest: "VIETNAM",
    country: "South East Asia",
    tagline: "A thousand years of beauty, untouched",
    image:
      "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1920&auto=format&fit=crop&q=85",
  },
  {
    id: "singapore-apr-2026",
    dest: "SINGAPORE",
    country: "The Lion City",
    tagline: "Where the future is already the present",
    image:
      "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1920&auto=format&fit=crop&q=85",
  },
];

export default function CinematicHero() {
  const navigate = useNavigate();
  const [active, setActive] = useState(0);
  const heroRef = useRef(null);
  const timerRef = useRef(null);

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const smoothX = useSpring(rawX, { stiffness: 55, damping: 20 });
  const smoothY = useSpring(rawY, { stiffness: 55, damping: 20 });

  const bgX = useTransform(smoothX, [-0.5, 0.5], [16, -16]);
  const bgY = useTransform(smoothY, [-0.5, 0.5], [10, -10]);
  const orbX = useTransform(smoothX, [-0.5, 0.5], [30, -30]);
  const orbY = useTransform(smoothY, [-0.5, 0.5], [18, -18]);
  const fgX = useTransform(smoothX, [-0.5, 0.5], [-22, 22]);
  const fgY = useTransform(smoothY, [-0.5, 0.5], [-12, 12]);

  const slide = SLIDES[active];

  const startTimer = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(
      () => setActive((p) => (p + 1) % SLIDES.length),
      5500
    );
  }, []);

  useEffect(() => {
    startTimer();
    return () => clearInterval(timerRef.current);
  }, [startTimer]);

  const goTo = (i) => {
    setActive(i);
    startTimer();
  };

  const onMouseMove = useCallback(
    (e) => {
      const rect = heroRef.current?.getBoundingClientRect();
      if (!rect) return;
      rawX.set((e.clientX - rect.left) / rect.width - 0.5);
      rawY.set((e.clientY - rect.top) / rect.height - 0.5);
    },
    [rawX, rawY]
  );

  const onMouseLeave = useCallback(() => {
    rawX.set(0);
    rawY.set(0);
  }, [rawX, rawY]);

  return (
    <section
      className="chero"
      ref={heroRef}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      {/* ── Crossfading backgrounds ── */}
      <AnimatePresence>
        <motion.div
          key={slide.id}
          className="chero__bg"
          style={{ backgroundImage: `url(${slide.image})`, x: bgX, y: bgY }}
          initial={{ opacity: 0, scale: 1.07 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
      </AnimatePresence>

      <div className="chero__overlay" />
      <div className="chero__grain" />

      {/* ── Floating depth orbs ── */}
      <motion.div className="chero__orb chero__orb--1" style={{ x: orbX, y: orbY }} />
      <motion.div className="chero__orb chero__orb--2" style={{ x: fgX, y: fgY }} />
      <motion.div
        className="chero__orb chero__orb--ring"
        style={{ x: orbX, y: orbY }}
        animate={{ rotate: 360 }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="chero__orb chero__orb--ring2"
        style={{ x: fgX, y: fgY }}
        animate={{ rotate: -360 }}
        transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
      />

      {/* ── Main content ── */}
      <div className="chero__content">
        <motion.div
          className="chero__eyebrow"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.6 }}
        >
          <span className="chero__live-dot" />
          Infinity Hikers — Adventure Collective
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.span
            key={`c-${active}`}
            className="chero__country"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.32 }}
          >
            {slide.country}
          </motion.span>
        </AnimatePresence>

        {/* Giant headline with its own parallax layer */}
        <motion.div style={{ x: fgX, y: fgY }}>
          <AnimatePresence mode="wait">
            <motion.h1
              key={`d-${active}`}
              className="chero__title"
              initial={{ opacity: 0, y: 80, clipPath: "inset(100% 0 0 0)" }}
              animate={{ opacity: 1, y: 0, clipPath: "inset(0% 0 0 0)" }}
              exit={{ opacity: 0, y: -50, clipPath: "inset(0 0 100% 0)" }}
              transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
            >
              {slide.dest}
            </motion.h1>
          </AnimatePresence>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.p
            key={`t-${active}`}
            className="chero__tagline"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.38, delay: 0.08 }}
          >
            {slide.tagline}
          </motion.p>
        </AnimatePresence>

        <motion.div
          className="chero__actions"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <motion.button
            className="chero__btn chero__btn--primary"
            onClick={() => navigate("/destinations")}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            Explore All Trips
            <span className="chero__btn-arrow">→</span>
          </motion.button>
          <motion.button
            className="chero__btn chero__btn--ghost"
            onClick={() => navigate(`/destination/${slide.id}`)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            View {slide.dest}
          </motion.button>
        </motion.div>
      </div>

      {/* ── Right-side destination nav ── */}
      <div className="chero__nav">
        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            className={`chero__nav-btn ${i === active ? "chero__nav-btn--active" : ""}`}
            onClick={() => goTo(i)}
            aria-label={s.dest}
          >
            <span className="chero__nav-label">{s.dest}</span>
            <span className="chero__nav-bar">
              {i === active && (
                <motion.span
                  key={`p-${active}`}
                  className="chero__nav-progress"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 5.5, ease: "linear" }}
                />
              )}
            </span>
          </button>
        ))}
      </div>

      {/* ── Slide counter ── */}
      <div className="chero__counter">
        <AnimatePresence mode="wait">
          <motion.span
            key={active}
            className="chero__counter-cur"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
          >
            {String(active + 1).padStart(2, "0")}
          </motion.span>
        </AnimatePresence>
        <span className="chero__counter-div">/</span>
        <span className="chero__counter-total">
          {String(SLIDES.length).padStart(2, "0")}
        </span>
      </div>

      {/* ── Scroll hint ── */}
      <motion.div
        className="chero__scroll"
        animate={{ y: [0, 9, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="chero__scroll-line" />
        <span>scroll</span>
      </motion.div>
    </section>
  );
}
