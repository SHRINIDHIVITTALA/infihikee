import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Calendar } from "lucide-react";
import { useHeroSlides } from "../context/HeroContext";
import { useSettings } from "../context/SettingsContext";
import { useItineraries } from "../context/ItineraryContext";
import { resolveHeroSlide, indexToursById } from "../utils/heroSlides";
import Masonry from "./Masonry";
import TextType from "./TextType";
import "./CinematicHero.css";

const SLIDE_DURATION = 5.5;

export default function CinematicHero() {
  const navigate = useNavigate();
  const { slides } = useHeroSlides();
  const { itineraries } = useItineraries();
  const { settings } = useSettings();

  const tours = useMemo(() => indexToursById(itineraries), [itineraries]);

  const SLIDES = useMemo(() => {
    return slides
      .filter((slide) => slide.status === "active")
      .map((slide) => resolveHeroSlide(slide, tours.get(slide.tourId)))
      // A slide with no image of its own and no linked tour to borrow one
      // from would render as an empty black panel
      .filter((slide) => slide.image);
  }, [slides, tours]);
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

  const count = SLIDES.length;
  // Admin edits can shrink the list out from under the current index
  const safeActive = count ? Math.min(active, count - 1) : 0;
  const slide = SLIDES[safeActive];

  // Only the currently shown destination's own photos appear in the
  // background — switches with the slide instead of mixing every tour
  // together. An admin can set specific background photos per slide
  // (Homepage Banner → Background Photos); if left blank it falls back to
  // the linked tour's gallery (Tours → Content → Trip Photos), then the
  // slide's single banner image.
  const masonryItems = useMemo(() => {
    const linkedTour = slide?.tourId ? tours.get(slide.tourId) : null;
    const images = Array.isArray(slide?.backgroundImages) && slide.backgroundImages.length
      ? slide.backgroundImages
      : linkedTour && Array.isArray(linkedTour.gallery) && linkedTour.gallery.length
      ? linkedTour.gallery
      : slide?.image
      ? [slide.image]
      : [];
    if (!images.length) return [];
    // Masonry is a static (non-looping) grid, unlike the old drifting wall —
    // a tour with only 2-3 photos would otherwise fill just the top corner
    // and leave the rest of the hero black. Cycling the same photos through
    // enough tiles keeps the whole background covered regardless of gallery size.
    const TARGET_TILE_COUNT = 18;
    const repeats = Math.max(1, Math.ceil(TARGET_TILE_COUNT / images.length));
    const tiles = [];
    for (let r = 0; r < repeats; r++) {
      images.forEach((image, i) => {
        const n = tiles.length;
        // Heights have no real aspect-ratio data, so they're varied
        // pseudo-randomly (stable per index) purely for a natural masonry look.
        tiles.push({
          id: `${slide?.tourId || slide?.id}-${r}-${i}`,
          img: image,
          height: 320 + ((n * 137) % 240),
        });
      });
    }
    return tiles;
  }, [slide, tours]);

  const startTimer = useCallback(() => {
    clearInterval(timerRef.current);
    if (count < 2) return;
    timerRef.current = setInterval(
      () => setActive((p) => (p + 1) % count),
      SLIDE_DURATION * 1000
    );
  }, [count]);

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

  // Every slide deactivated in the admin panel — nothing to show
  if (!slide) return null;

  return (
    <section
      className="chero"
      ref={heroRef}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      {/* ── Drifting photo wall background ── */}
      <motion.div className="chero__bg chero__bg--wall" style={{ x: bgX, y: bgY }}>
        <AnimatePresence mode="wait">
          {masonryItems.length > 0 && (
            <motion.div
              key={slide?.tourId || slide?.id}
              className="chero__bg-wall-inner"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            >
              <Masonry
                items={masonryItems}
                ease="power3.out"
                duration={0.6}
                stagger={0.05}
                animateFrom="random"
                scaleOnHover={true}
                hoverScale={0.97}
                blurToFocus={true}
                colorShiftOnHover={false}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

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
          {settings.businessName} — Adventure Collective
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.span
            key={`c-${safeActive}`}
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
              key={`d-${safeActive}`}
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

        {slide.dates && (
          <AnimatePresence mode="wait">
            <motion.div
              key={`dt-${safeActive}`}
              className="chero__dates"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.34, delay: 0.04 }}
            >
              <Calendar size={13} strokeWidth={2.2} />
              {slide.dates}
            </motion.div>
          </AnimatePresence>
        )}

        {slide.tagline && (
          <AnimatePresence mode="wait">
            <motion.p
              key={`t-${safeActive}`}
              className="chero__tagline"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.38, delay: 0.08 }}
            >
              <TextType
                text={slide.tagline}
                as="span"
                typingSpeed={32}
                initialDelay={200}
                loop={false}
                showCursor={true}
                hideCursorWhileTyping={false}
                cursorCharacter="|"
              />
            </motion.p>
          </AnimatePresence>
        )}

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
          {slide.tourId && slide.tourAvailable && (
            <motion.button
              className="chero__btn chero__btn--ghost"
              onClick={() => navigate(`/destination/${slide.tourId}`)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              View {slide.dest}
            </motion.button>
          )}
        </motion.div>
      </div>

      {/* ── Right-side destination nav ── */}
      <div className="chero__nav">
        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            className={`chero__nav-btn ${i === safeActive ? "chero__nav-btn--active" : ""}`}
            onClick={() => goTo(i)}
            aria-label={s.dest}
          >
            <span className="chero__nav-label">{s.dest}</span>
            <span className="chero__nav-bar">
              {i === safeActive && (
                <motion.span
                  key={`p-${safeActive}`}
                  className="chero__nav-progress"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: SLIDE_DURATION, ease: "linear" }}
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
            key={safeActive}
            className="chero__counter-cur"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
          >
            {String(safeActive + 1).padStart(2, "0")}
          </motion.span>
        </AnimatePresence>
        <span className="chero__counter-div">/</span>
        <span className="chero__counter-total">
          {String(count).padStart(2, "0")}
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
