import { createContext, useContext, useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";

export const DEFAULT_SETTINGS = {
  whatsapp: "919916258596",
  phone: "+91 99162 58596",
  email: "infinityhikers@gmail.com",
  instagram: "https://www.instagram.com/infinity.hikers",
  businessName: "Infinity Pravasa",
  tagline: "482+ adventurers. Zero regrets.",
  footerDescription: "Premium adventures at accessible prices — safely curated by local experts so you can focus on the joy of discovery.",
  footerNote: "Made with ♥ for adventure lovers",
  currency: "INR",
};

const SettingsContext = createContext();

export function SettingsProvider({ children }) {
  // Seeded with the bundled defaults so the site never renders blank fields
  // while the network fetch is in flight, or if Supabase isn't configured.
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;
    supabase
      .from("site_config")
      .select("settings")
      .eq("id", 1)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          console.warn("Could not load settings from Supabase, showing built-in defaults:", error.message);
          return;
        }
        if (data?.settings) setSettings({ ...DEFAULT_SETTINGS, ...data.settings });
      });
    return () => { cancelled = true; };
  }, []);

  const updateSettings = async (updates) => {
    const next = { ...settings, ...updates };
    if (!isSupabaseConfigured()) {
      throw new Error("Saving isn't set up yet — add VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY in .env.");
    }
    const { error } = await supabase.from("site_config").update({ settings: next }).eq("id", 1);
    if (error) throw new Error(`Couldn't save settings: ${error.message}`);
    setSettings(next);
  };

  const resetSettings = () => setSettings(DEFAULT_SETTINGS);

  const waLink = (message = `Hi! I'm interested in booking a trip with ${settings.businessName}.`) =>
    `https://wa.me/${String(settings.whatsapp || "").replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;

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
