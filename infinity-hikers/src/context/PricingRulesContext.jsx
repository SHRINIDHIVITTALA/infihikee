import { createContext, useContext, useState, useEffect } from "react";

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
const STORAGE_KEY = "infinityHikers_pricingRules";

export function PricingRulesProvider({ children }) {
  const [rules, setRules] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return { ...DEFAULT_PRICING_RULES, ...parsed };
      }
    } catch {}
    return DEFAULT_PRICING_RULES;
  });

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(rules)); } catch { /* storage is unavailable */ }
  }, [rules]);

  const updateRules = (updates) => setRules((prev) => ({ ...prev, ...updates }));
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
