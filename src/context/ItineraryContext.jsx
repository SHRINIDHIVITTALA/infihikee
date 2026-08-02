import { createContext, useContext, useState, useEffect } from "react";
import defaultItineraries from "../data/itineraries";

const ItineraryContext = createContext();

const STORAGE_KEY = "infinityHikers_itineraries";
const STORAGE_VERSION = "v5";
const VERSION_KEY = "infinityHikers_version";
const REMOVED_IMAGE_ID = "photo-1586208958839-06c17cacdf08";
const FALLBACK_TOUR_IMAGE = "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80";

export function ItineraryProvider({ children }) {
  const [itineraries, setItineraries] = useState(() => {
    try {
      // Clear stale data when version changes
      const storedVersion = localStorage.getItem(VERSION_KEY);
      if (storedVersion !== STORAGE_VERSION) {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.setItem(VERSION_KEY, STORAGE_VERSION);
        return defaultItineraries;
      }
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed
          .filter((item) => item && typeof item === "object" && typeof item.id === "string" && typeof item.destination === "string")
          .map((item) => ({
            ...item,
            gallery: Array.isArray(item.gallery)
              ? item.gallery.filter((image) => !String(image).includes(REMOVED_IMAGE_ID))
              : item.gallery,
          }));
      }
    } catch {
      // fall through
    }
    return defaultItineraries;
  });

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(itineraries)); } catch { /* storage is unavailable */ }
  }, [itineraries]);

  const addItinerary = (itinerary) => {
    const image = itinerary.image || FALLBACK_TOUR_IMAGE;
    const newItem = {
      ...itinerary,
      image,
      gallery: Array.isArray(itinerary.gallery) && itinerary.gallery.length ? itinerary.gallery : [image],
      itinerary: Array.isArray(itinerary.itinerary) ? itinerary.itinerary : [],
      highlights: Array.isArray(itinerary.highlights) ? itinerary.highlights : [],
      includes: Array.isArray(itinerary.includes) ? itinerary.includes : [],
      id:
        itinerary.id ||
        `${itinerary.destination.toLowerCase()}-${Date.now()}`,
      status: itinerary.status || "active",
    };
    setItineraries((prev) => [...prev, newItem]);
    return newItem;
  };

  const updateItinerary = (id, updates) => {
    setItineraries((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const deleteItinerary = (id) => {
    setItineraries((prev) => prev.filter((item) => item.id !== id));
  };

  const getActiveItineraries = () => {
    const seen = new Set();
    return itineraries
      .filter((i) => i.status === "active")
      .filter((i) => {
        if (seen.has(i.id)) return false;
        seen.add(i.id);
        return true;
      });
  };

  const resetToDefaults = () => {
    setItineraries(defaultItineraries);
  };

  return (
    <ItineraryContext.Provider
      value={{
        itineraries,
        addItinerary,
        updateItinerary,
        deleteItinerary,
        getActiveItineraries,
        resetToDefaults,
      }}
    >
      {children}
    </ItineraryContext.Provider>
  );
}

export function useItineraries() {
  const context = useContext(ItineraryContext);
  if (!context)
    throw new Error("useItineraries must be used within ItineraryProvider");
  return context;
}
