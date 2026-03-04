import { useState, useRef } from "react";
import { useItineraries } from "../context/ItineraryContext";
import { motion, AnimatePresence } from "framer-motion";
import "./Calculator.css";

const ACCOMMODATION_TIERS = [
  { value: "standard", label: "Standard (3-Star)", icon: "🏨", multiplier: 0.85 },
  { value: "comfort", label: "Comfort (4-Star)", icon: "🏩", multiplier: 1 },
  { value: "premium", label: "Premium (5-Star)", icon: "🏰", multiplier: 1.4 },
];

const PREFERENCES = [
  { key: "adventure", label: "Adventure Activities", icon: "🧗", cost: 3999 },
  { key: "wellness", label: "Spa & Wellness", icon: "🧖", cost: 2999 },
  { key: "foodie", label: "Local Food Tours", icon: "🍜", cost: 1999 },
  { key: "photography", label: "Pro Photography", icon: "📸", cost: 4999 },
];

export default function Calculator() {
  const { getActiveItineraries } = useItineraries();
  const itineraries = getActiveItineraries();

  const [selectedTrip, setSelectedTrip] = useState("");
  const [travelers, setTravelers] = useState(2);
  const [accommodation, setAccommodation] = useState("comfort");
  const [preferences, setPreferences] = useState({});
  const [extras, setExtras] = useState({
    insurance: false,
    airportTransfer: false,
    privateRoom: false,
  });
  const [saved, setSaved] = useState(false);
  const [shared, setShared] = useState(false);
  const resultsRef = useRef(null);

  const trip = itineraries.find((i) => i.id === selectedTrip);

  const extraCosts = {
    insurance: 2999,
    airportTransfer: 3499,
    privateRoom: 8999,
  };

  const extraLabels = {
    insurance: "🛡️ Travel Insurance",
    airportTransfer: "🚗 Airport Transfer",
    privateRoom: "🛏️ Private Room Upgrade",
  };

  const tier = ACCOMMODATION_TIERS.find((t) => t.value === accommodation);
  const basePerPerson = trip ? Math.round((trip.price || 0) * (tier?.multiplier || 1)) : 0;

  const prefTotal = Object.entries(preferences).reduce(
    (sum, [key, val]) => sum + (val ? (PREFERENCES.find((p) => p.key === key)?.cost || 0) : 0),
    0
  );

  const extrasTotal = Object.entries(extras).reduce(
    (sum, [key, val]) => sum + (val ? extraCosts[key] : 0),
    0
  );

  const perPerson = basePerPerson + prefTotal + extrasTotal;
  const totalCost = perPerson * travelers;

  let discount = 0;
  if (travelers >= 10) discount = 0.1;
  else if (travelers >= 5) discount = 0.05;
  else if (travelers >= 3) discount = 0.02;

  const discountAmount = Math.round(totalCost * discount);
  const finalCost = totalCost - discountAmount;

  const handleSave = () => {
    if (!trip) return;
    const estimate = {
      trip: trip.destination,
      dates: trip.dates,
      travelers,
      accommodation: tier?.label,
      total: finalCost,
      savedAt: new Date().toISOString(),
    };
    const existing = JSON.parse(localStorage.getItem("infinityHikers_estimates") || "[]");
    existing.push(estimate);
    localStorage.setItem("infinityHikers_estimates", JSON.stringify(existing));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleShare = async () => {
    if (!trip) return;
    const text = `🌍 Infinity Hikers Trip Estimate\n📍 ${trip.destination} (${trip.dates})\n👥 ${travelers} Travelers\n🏨 ${tier?.label}\n💰 Total: ₹${finalCost.toLocaleString("en-IN")}\n\nBook now: infinityhikers.com`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Trip Estimate", text });
      } catch {
        // user cancelled
      }
    } else {
      await navigator.clipboard.writeText(text);
      setShared(true);
      setTimeout(() => setShared(false), 2500);
    }
  };

  return (
    <div className="calc">
      <div className="calc__header">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Trip <span className="accent">Calculator</span>
        </motion.h1>
        <p>Plan your perfect trip and get an instant cost estimate</p>
      </div>

      <div className="calc__content">
        <motion.div
          className="calc__form"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Trip selection */}
          <div className="calc__field">
            <label>Select Destination</label>
            <select
              value={selectedTrip}
              onChange={(e) => setSelectedTrip(e.target.value)}
            >
              <option value="">Choose a trip...</option>
              {itineraries.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.destination} — {item.dates} ({item.duration})
                </option>
              ))}
            </select>
          </div>

          {/* Travelers */}
          <div className="calc__field">
            <label>Number of Travelers</label>
            <div className="calc__stepper">
              <button
                onClick={() => setTravelers(Math.max(1, travelers - 1))}
                disabled={travelers <= 1}
              >
                −
              </button>
              <span className="calc__stepper-value">{travelers}</span>
              <button onClick={() => setTravelers(Math.min(20, travelers + 1))}>+</button>
            </div>
            {discount > 0 && (
              <p className="calc__discount-note">
                🎉 {discount * 100}% group discount applied!
              </p>
            )}
          </div>

          {/* Accommodation */}
          <div className="calc__field">
            <label>Accommodation Tier</label>
            <div className="calc__tier-options">
              {ACCOMMODATION_TIERS.map((t) => (
                <button
                  key={t.value}
                  className={`calc__tier ${accommodation === t.value ? "calc__tier--active" : ""}`}
                  onClick={() => setAccommodation(t.value)}
                >
                  <span className="calc__tier-icon">{t.icon}</span>
                  <span className="calc__tier-label">{t.label}</span>
                  {t.multiplier !== 1 && (
                    <span className="calc__tier-tag">
                      {t.multiplier < 1 ? `${Math.round((1 - t.multiplier) * 100)}% less` : `${Math.round((t.multiplier - 1) * 100)}% more`}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Activity Preferences */}
          <div className="calc__field">
            <label>Activity Preferences</label>
            <div className="calc__prefs">
              {PREFERENCES.map((p) => (
                <label key={p.key} className={`calc__pref ${preferences[p.key] ? "calc__pref--active" : ""}`}>
                  <input
                    type="checkbox"
                    checked={!!preferences[p.key]}
                    onChange={(e) =>
                      setPreferences({ ...preferences, [p.key]: e.target.checked })
                    }
                  />
                  <span className="calc__pref-icon">{p.icon}</span>
                  <div className="calc__pref-info">
                    <span>{p.label}</span>
                    <span className="calc__pref-cost">+₹{p.cost.toLocaleString("en-IN")}/person</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Extras */}
          <div className="calc__field">
            <label>Add-ons</label>
            <div className="calc__extras">
              {Object.entries(extraCosts).map(([key, cost]) => (
                <label key={key} className="calc__extra">
                  <input
                    type="checkbox"
                    checked={extras[key]}
                    onChange={(e) =>
                      setExtras({ ...extras, [key]: e.target.checked })
                    }
                  />
                  <div className="calc__extra-info">
                    <span>{extraLabels[key]}</span>
                    <span className="calc__extra-price">
                      +₹{cost.toLocaleString("en-IN")}/person
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Results */}
        <motion.div
          className="calc__results"
          ref={resultsRef}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="calc__results-card">
            <h3>Cost Breakdown</h3>

            {trip ? (
              <>
                <div className="calc__result-trip">
                  <div
                    className="calc__result-trip-img"
                    style={{ backgroundImage: `url(${trip.image})` }}
                  />
                  <div>
                    <h4>{trip.destination}</h4>
                    <p>{trip.dates}</p>
                    <p>{trip.duration}</p>
                    {trip.difficulty && (
                      <span className={`calc__diff-badge calc__diff-badge--${trip.difficulty.toLowerCase()}`}>
                        {trip.difficulty}
                      </span>
                    )}
                  </div>
                </div>

                <div className="calc__breakdown">
                  <div className="calc__row">
                    <span>Base Price ({tier?.label})</span>
                    <span>₹{basePerPerson.toLocaleString("en-IN")}/person</span>
                  </div>
                  {Object.entries(preferences)
                    .filter(([, val]) => val)
                    .map(([key]) => {
                      const p = PREFERENCES.find((pr) => pr.key === key);
                      return (
                        <div className="calc__row" key={key}>
                          <span>{p?.icon} {p?.label}</span>
                          <span>+₹{p?.cost.toLocaleString("en-IN")}/person</span>
                        </div>
                      );
                    })}
                  {Object.entries(extras)
                    .filter(([, val]) => val)
                    .map(([key]) => (
                      <div className="calc__row" key={key}>
                        <span>{extraLabels[key]}</span>
                        <span>+₹{extraCosts[key].toLocaleString("en-IN")}/person</span>
                      </div>
                    ))}
                  <div className="calc__row calc__row--sub">
                    <span>Per Person Total</span>
                    <span>₹{perPerson.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="calc__row">
                    <span>× {travelers} traveler{travelers > 1 ? "s" : ""}</span>
                    <span>₹{totalCost.toLocaleString("en-IN")}</span>
                  </div>
                  {discount > 0 && (
                    <div className="calc__row calc__row--discount">
                      <span>Group Discount ({discount * 100}%)</span>
                      <span>-₹{discountAmount.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                </div>

                <div className="calc__total">
                  <span>Total Cost</span>
                  <span className="calc__total-amount">
                    ₹{finalCost.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="calc__actions">
                  <a
                    href={`https://wa.me/919916258596?text=Hi! I'd like to book the ${trip.destination} trip (${trip.dates}) for ${travelers} traveler(s) with ${tier?.label} accommodation. Estimated total: ₹${finalCost.toLocaleString("en-IN")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="calc__book-btn"
                  >
                    Book via WhatsApp
                  </a>
                  <div className="calc__secondary-actions">
                    <button className="calc__save-btn" onClick={handleSave}>
                      {saved ? "✓ Saved!" : "💾 Save Estimate"}
                    </button>
                    <button className="calc__share-btn" onClick={handleShare}>
                      {shared ? "✓ Copied!" : "📤 Share"}
                    </button>
                  </div>
                  <a href="tel:+919916258596" className="calc__call-btn">
                    📞 Call +91 99162 58596
                  </a>
                </div>
              </>
            ) : (
              <div className="calc__empty">
                <div className="calc__empty-icon">🧮</div>
                <p>Select a destination to see the cost breakdown</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
