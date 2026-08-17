import { createContext, useContext, useState, useEffect } from "react";

const DEFAULT_HERO_SLIDES = [
  {
    id: "hero-bali",
    dest: "BALI",
    country: "Indonesia",
    tagline: "Where gods surf & time forgets itself",
    dateStart: "2026-05-19",
    dateEnd: "2026-05-26",
    dates: "May 19 - 26, 2026",
    image:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1920&auto=format&fit=crop&q=85",
    tourId: "bali-may-2026",
    status: "active",
  },
  {
    id: "hero-sri-lanka",
    dest: "SRI LANKA",
    country: "Pearl of the Indian Ocean",
    tagline: "Beaches, tea country & timeless culture",
    dateStart: "2026-08-06",
    dateEnd: "2026-08-11",
    dates: "August 6 - 11, 2026",
    image:
      "https://images.unsplash.com/photo-1588598198321-9735fd52455b?w=1920&auto=format&fit=crop&q=85",
    tourId: "sri-lanka-aug-2026",
    status: "active",
  },
];

const HeroContext = createContext();
const STORAGE_KEY = "infinityHikers_heroSlides";

export function HeroProvider({ children }) {
  const [slides, setSlides] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // Only the id is required: a slide may carry no image of its own and
          // inherit the linked tour's cover photo instead
          const valid = parsed.filter(
            (s) => s && typeof s === "object" && typeof s.id === "string"
          );
          // An empty stored array would leave the homepage with no hero at all
          if (valid.length) return valid;
        }
      }
    } catch {
      // fall through to defaults
    }
    return DEFAULT_HERO_SLIDES;
  });

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(slides)); } catch { /* storage is unavailable */ }
  }, [slides]);

  const addSlide = (slide) => {
    const newSlide = {
      ...slide,
      id: slide.id || `hero-${Date.now()}`,
      status: slide.status || "active",
    };
    setSlides((prev) => [...prev, newSlide]);
    return newSlide;
  };

  const updateSlide = (id, updates) =>
    setSlides((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));

  const deleteSlide = (id) =>
    setSlides((prev) => prev.filter((s) => s.id !== id));

  const moveSlide = (id, direction) =>
    setSlides((prev) => {
      const i = prev.findIndex((s) => s.id === id);
      const j = i + (direction === "up" ? -1 : 1);
      if (i === -1 || j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  const resetSlides = () => setSlides(DEFAULT_HERO_SLIDES);

  const getActiveSlides = () => slides.filter((s) => s.status === "active");

  return (
    <HeroContext.Provider
      value={{ slides, addSlide, updateSlide, deleteSlide, moveSlide, resetSlides, getActiveSlides }}
    >
      {children}
    </HeroContext.Provider>
  );
}

export function useHeroSlides() {
  const ctx = useContext(HeroContext);
  if (!ctx) throw new Error("useHeroSlides must be used within HeroProvider");
  return ctx;
}
