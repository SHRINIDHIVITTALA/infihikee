import { createContext, useContext, useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";

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
    backgroundImages: [],
    tourId: "bali-may-2026",
    status: "active",
    sortOrder: 0,
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
    backgroundImages: [],
    tourId: "sri-lanka-aug-2026",
    status: "active",
    sortOrder: 1,
  },
];

const HeroContext = createContext();

function rowToSlide(row) {
  return {
    id: row.id,
    dest: row.dest,
    country: row.country,
    tagline: row.tagline,
    dateStart: row.date_start,
    dateEnd: row.date_end,
    dates: row.dates,
    image: row.image,
    backgroundImages: Array.isArray(row.background_images) ? row.background_images : [],
    tourId: row.tour_id,
    status: row.status,
    sortOrder: row.sort_order,
  };
}

function slideToRow(slide) {
  const row = {};
  const set = (col, val) => { if (val !== undefined) row[col] = val; };
  set("id", slide.id);
  set("dest", slide.dest);
  set("country", slide.country);
  set("tagline", slide.tagline);
  set("date_start", slide.dateStart || null);
  set("date_end", slide.dateEnd || null);
  set("dates", slide.dates);
  set("image", slide.image);
  set("background_images", slide.backgroundImages);
  // "" (the "None — hide the View button" option) must become null for the FK
  set("tour_id", slide.tourId || null);
  set("status", slide.status);
  set("sort_order", slide.sortOrder);
  return row;
}

export function HeroProvider({ children }) {
  // Seeded with the bundled defaults so the homepage banner is never empty
  // while the network fetch is in flight, or if Supabase isn't configured.
  const [slides, setSlides] = useState(DEFAULT_HERO_SLIDES);

  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;
    supabase
      .from("hero_slides")
      .select("*")
      .order("sort_order", { ascending: true })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          console.warn("Could not load banner pictures from Supabase, showing built-in defaults:", error.message);
          return;
        }
        if (data && data.length) setSlides(data.map(rowToSlide));
      });
    return () => { cancelled = true; };
  }, []);

  const requireConfigured = () => {
    if (!isSupabaseConfigured()) {
      throw new Error("Saving isn't set up yet — add VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY in .env.");
    }
  };

  const addSlide = async (slide) => {
    requireConfigured();
    const nextOrder = slides.length ? Math.max(...slides.map((s) => s.sortOrder ?? 0)) + 1 : 0;
    const newSlide = {
      ...slide,
      id: slide.id || `hero-${Date.now()}`,
      status: slide.status || "active",
      sortOrder: nextOrder,
    };
    const { error } = await supabase.from("hero_slides").insert(slideToRow(newSlide));
    if (error) throw new Error(`Couldn't save the banner picture: ${error.message}`);
    setSlides((prev) => [...prev, newSlide]);
    return newSlide;
  };

  const updateSlide = async (id, updates) => {
    requireConfigured();
    const { error } = await supabase.from("hero_slides").update(slideToRow(updates)).eq("id", id);
    if (error) throw new Error(`Couldn't save changes: ${error.message}`);
    setSlides((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const deleteSlide = async (id) => {
    requireConfigured();
    const { error } = await supabase.from("hero_slides").delete().eq("id", id);
    if (error) throw new Error(`Couldn't delete: ${error.message}`);
    setSlides((prev) => prev.filter((s) => s.id !== id));
  };

  const moveSlide = async (id, direction) => {
    const i = slides.findIndex((s) => s.id === id);
    const j = i + (direction === "up" ? -1 : 1);
    if (i === -1 || j < 0 || j >= slides.length) return;
    requireConfigured();
    const a = slides[i], b = slides[j];
    const [{ error: e1 }, { error: e2 }] = await Promise.all([
      supabase.from("hero_slides").update({ sort_order: b.sortOrder }).eq("id", a.id),
      supabase.from("hero_slides").update({ sort_order: a.sortOrder }).eq("id", b.id),
    ]);
    if (e1 || e2) throw new Error(`Couldn't reorder: ${(e1 || e2).message}`);
    setSlides((prev) => {
      const next = [...prev];
      const sortA = next[i].sortOrder, sortB = next[j].sortOrder;
      [next[i], next[j]] = [next[j], next[i]];
      next[i] = { ...next[i], sortOrder: sortA };
      next[j] = { ...next[j], sortOrder: sortB };
      return next;
    });
  };

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
