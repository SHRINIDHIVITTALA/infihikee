import { createContext, useContext, useState, useEffect, useRef } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";

export const DEFAULT_SETTINGS = {
  // Falls back to the bundled /logo.png (see Navbar/Footer) until an admin
  // uploads a replacement.
  logoUrl: "",
  whatsapp: "919916258596",
  phone: "+91 99162 58596",
  email: "infinityhikers@gmail.com",
  instagram: "https://www.instagram.com/infinity.hikers",
  businessName: "Infinity Pravasa",
  tagline: "482+ adventurers. Zero regrets.",
  footerDescription: "Premium adventures at accessible prices — safely curated by local experts so you can focus on the joy of discovery.",
  footerNote: "Made with ♥ for adventure lovers",
  currency: "INR",
  // Homepage "Happy Travelers" stat and every other "N+ adventurers" mention
  // site-wide — a single editable number instead of the same claim hardcoded
  // separately (and inconsistently) in several files. See MOCK_DATA_AUDIT.md.
  travelerCount: 482,
  // Homepage "Would Recommend" stat — no real survey/NPS system exists yet,
  // so this is a plain business-claimed number, at least centralized here
  // instead of buried unreachably in JSX.
  recommendPercent: 98,
};

const SettingsContext = createContext();

export function SettingsProvider({ children }) {
  // Seeded with the bundled defaults so the site never renders blank fields
  // while the network fetch is in flight, or if Supabase isn't configured.
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  // Mirrors `settings` synchronously so a save started before a previous one
  // resolves reads the latest value instead of a stale render-closure copy.
  const settingsRef = useRef(DEFAULT_SETTINGS);
  // Set the moment any save starts, so the initial fetch below never clobbers
  // a change the admin already made while that fetch was still in flight.
  const mutatedRef = useRef(false);
  const applySettings = (value) => {
    settingsRef.current = value;
    setSettings(value);
  };

  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;
    supabase
      .from("site_config")
      .select("settings")
      .eq("id", 1)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled || mutatedRef.current) return;
        if (error) {
          console.warn("Could not load settings from Supabase, showing built-in defaults:", error.message);
          return;
        }
        if (data?.settings) applySettings({ ...DEFAULT_SETTINGS, ...data.settings });
      });
    return () => { cancelled = true; };
  }, []);

  const persist = async (next) => {
    mutatedRef.current = true;
    if (!isSupabaseConfigured()) {
      throw new Error("Saving isn't set up yet — add VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY in .env.");
    }
    const { error } = await supabase.from("site_config").update({ settings: next }).eq("id", 1);
    if (error) throw new Error(`Couldn't save settings: ${error.message}`);
    applySettings(next);
  };

  const updateSettings = async (updates) => persist({ ...settingsRef.current, ...updates });

  const resetSettings = () => persist(DEFAULT_SETTINGS);

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
