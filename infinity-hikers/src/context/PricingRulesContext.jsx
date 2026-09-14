import { createContext, useContext, useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";

export const DEFAULT_PRICING_RULES = {
  accommodationTiers: [
    { value: "standard", label: "Standard (3-Star)", icon: "🏨", multiplier: 0.85 },
    { value: "comfort", label: "Comfort (4-Star)", icon: "🏩", multiplier: 1 },
    { value: "premium", label: "Premium (5-Star)", icon: "🏰", multiplier: 1.4 },
  ],
  activityAddOns: [
    { key: "adventure", label: "Adventure Activities", icon: "🧗", cost: 3999 },
    { key: "wellness", label: "Spa & Wellness", icon: "🧖", cost: 2999 },
    { key: "foodie", label: "Local Food Tours", icon: "🍜", cost: 1999 },
    { key: "photography", label: "Pro Photography", icon: "📸", cost: 4999 },
  ],
  extraAddOns: [
    { key: "insurance", label: "🛡️ Travel Insurance", cost: 2999 },
    { key: "airportTransfer", label: "🚗 Airport Transfer", cost: 3499 },
    { key: "privateRoom", label: "🛏️ Private Room Upgrade", cost: 8999 },
  ],
  groupDiscountTiers: [
    { minTravelers: 10, discountPercent: 10 },
    { minTravelers: 5, discountPercent: 5 },
    { minTravelers: 3, discountPercent: 2 },
  ],
};

const PricingRulesContext = createContext();

export function PricingRulesProvider({ children }) {
  const [rules, setRules] = useState(DEFAULT_PRICING_RULES);

  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;
    supabase
      .from("site_config")
      .select("pricing_rules")
      .eq("id", 1)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          console.warn("Could not load pricing rules from Supabase, showing built-in defaults:", error.message);
          return;
        }
        if (data?.pricing_rules) setRules({ ...DEFAULT_PRICING_RULES, ...data.pricing_rules });
      });
    return () => { cancelled = true; };
  }, []);

  const updateRules = async (updates) => {
    const next = { ...rules, ...updates };
    if (!isSupabaseConfigured()) {
      throw new Error("Saving isn't set up yet — add VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY in .env.");
    }
    const { error } = await supabase.from("site_config").update({ pricing_rules: next }).eq("id", 1);
    if (error) throw new Error(`Couldn't save: ${error.message}`);
    setRules(next);
  };

  const resetRules = () => setRules(DEFAULT_PRICING_RULES);

  // Highest matching tier wins — tiers should be sorted by minTravelers descending by the admin,
  // but we defensively pick the best match regardless of stored order.
  const getGroupDiscountPercent = (travelers) =>
    rules.groupDiscountTiers
      .filter((t) => travelers >= Number(t.minTravelers))
      .reduce((best, t) => Math.max(best, Number(t.discountPercent) || 0), 0);

  return (
    <PricingRulesContext.Provider value={{ rules, updateRules, resetRules, getGroupDiscountPercent }}>
      {children}
    </PricingRulesContext.Provider>
  );
}

export function usePricingRules() {
  const ctx = useContext(PricingRulesContext);
  if (!ctx) throw new Error("usePricingRules must be used within PricingRulesProvider");
  return ctx;
}
