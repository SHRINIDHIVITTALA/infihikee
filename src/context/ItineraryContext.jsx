import { createContext, useContext, useState, useEffect } from "react";
import defaultItineraries from "../data/itineraries";

const ItineraryContext = createContext();

const STORAGE_KEY = "infinityHikers_itineraries";
const STORAGE_VERSION = "v3";
const VERSION_KEY = "infinityHikers_version";

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
        return JSON.parse(stored);
      }
    } catch {
      // fall through
    }
    return defaultItineraries;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(itineraries));
  }, [itineraries]);

  const addItinerary = (itinerary) => {
    const newItem = {
      ...itinerary,
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
