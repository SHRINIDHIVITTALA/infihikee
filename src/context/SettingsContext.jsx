import { createContext, useContext, useState, useEffect } from "react";

export const DEFAULT_SETTINGS = {
  whatsapp: "919916258596",
  phone: "+91 99162 58596",
  email: "infinityhikers@gmail.com",
  instagram: "https://www.instagram.com/infinity.hikers",
  businessName: "Infinity Hikers",
  tagline: "482+ adventurers. Zero regrets.",
};

const SettingsContext = createContext();
const STORAGE_KEY = "infinityHikers_settings";

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    } catch {}
    return DEFAULT_SETTINGS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (updates) =>
    setSettings((prev) => ({ ...prev, ...updates }));

  const resetSettings = () => setSettings(DEFAULT_SETTINGS);

  const waLink = (message = "Hi! I'm interested in booking a trip with Infinity Hikers.") =>
    `https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(message)}`;

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings, waLink }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
