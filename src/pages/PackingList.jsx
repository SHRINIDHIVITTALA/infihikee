import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useItineraries } from "../context/ItineraryContext";
import "./PackingList.css";

const PACKING_DATA = {
  essentials: {
    label: "Essentials",
    icon: "🎒",
    items: ["Passport & copies", "Travel insurance docs", "Flight tickets (printed + digital)", "Hotel booking confirmations", "Cash + forex card", "Phone & charger", "Power bank", "Universal adapter"],
  },
  clothing: {
    label: "Clothing",
    icon: "👕",
    items: ["Light t-shirts × 4", "Comfortable pants × 3", "Underwear × 5", "Socks × 4 pairs", "Light jacket / hoodie", "Sleepwear", "Comfortable walking shoes", "Flip flops / sandals"],
  },
  toiletries: {
    label: "Toiletries",
    icon: "🧴",
    items: ["Toothbrush & toothpaste", "Shampoo (travel size)", "Sunscreen SPF 50+", "Lip balm", "Deodorant", "Moisturizer", "Hand sanitizer", "Wet wipes"],
  },
  health: {
    label: "Health & Safety",
    icon: "💊",
    items: ["Personal medications", "First aid kit (basic)", "Motion sickness pills", "Insect repellent", "Band-aids", "ORS packets", "Pain relief (paracetamol)"],
  },
  tech: {
    label: "Tech & Gadgets",
    icon: "📱",
    items: ["Camera / GoPro", "Extra memory cards", "Earphones / headphones", "Laptop / tablet (optional)", "Selfie stick / tripod"],
  },
};

const ACTIVITY_EXTRAS = {
  trekking: {
    label: "Trekking Extras",
    icon: "🥾",
    items: ["Trekking boots", "Hiking poles", "Waterproof jacket", "Thermal layers", "Gloves & beanie", "Backpack rain cover", "Quick-dry towel", "Energy bars"],
  },
  beach: {
    label: "Beach Extras",
    icon: "🏖️",
    items: ["Swimwear × 2", "Beach towel", "Waterproof phone pouch", "Snorkeling gear (optional)", "After-sun lotion", "Beach bag", "Reef-safe sunscreen"],
  },
  cultural: {
    label: "Cultural Extras",
    icon: "🏛️",
    items: ["Modest clothing for temples", "Scarf / shawl", "Comfortable city shoes", "Small daypack", "Phrasebook / translator app", "Notebook & pen"],
  },
};

const WEATHER_EXTRAS = {
  hot: { label: "Hot Weather", items: ["Sun hat / cap", "Sunglasses", "Light breathable fabrics", "Cooling towel", "Water bottle (insulated)"] },
  cold: { label: "Cold Weather", items: ["Down jacket", "Thermal innerwear", "Warm socks", "Scarf & gloves", "Hand warmers"] },
  rainy: { label: "Rainy Season", items: ["Compact umbrella", "Waterproof bag cover", "Quick-dry clothing", "Waterproof shoes", "Ziplock bags for electronics"] },
};

export default function PackingList() {
  const { getActiveItineraries } = useItineraries();
  const itineraries = getActiveItineraries();
  const [selectedTrip, setSelectedTrip] = useState("");
  const [weather, setWeather] = useState("hot");
  const [checkedItems, setCheckedItems] = useState({});

  const trip = itineraries.find((i) => i.id === selectedTrip);

  const categories = useMemo(() => {
    const cats = { ...PACKING_DATA };

    // Add activity-specific extras
    if (trip?.activityType && ACTIVITY_EXTRAS[trip.activityType]) {
      cats[trip.activityType] = ACTIVITY_EXTRAS[trip.activityType];
    }

    // Add weather extras
    if (weather && WEATHER_EXTRAS[weather]) {
      cats[`weather_${weather}`] = {
        label: WEATHER_EXTRAS[weather].label,
        icon: weather === "hot" ? "☀️" : weather === "cold" ? "❄️" : "🌧️",
        items: WEATHER_EXTRAS[weather].items,
      };
    }

    return cats;
  }, [trip, weather]);

  const toggleItem = (key) => {
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const totalItems = Object.values(categories).reduce((sum, cat) => sum + cat.items.length, 0);
  const checkedCount = Object.values(checkedItems).filter(Boolean).length;
  const progress = totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0;

  const saveList = () => {
    const data = { selectedTrip, weather, checkedItems, timestamp: Date.now() };
    localStorage.setItem("infinityHikers_packingList", JSON.stringify(data));
    alert("Packing list saved!");
  };

  const loadList = () => {
    const saved = localStorage.getItem("infinityHikers_packingList");
    if (saved) {
      const data = JSON.parse(saved);
      setSelectedTrip(data.selectedTrip || "");
      setWeather(data.weather || "hot");
      setCheckedItems(data.checkedItems || {});
    }
  };

  return (
    <div className="packing">
      <div className="packing__bg-orb packing__bg-orb--1" />

      <motion.div
        className="packing__header"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <span className="packing__badge">🤖 AI-Generated</span>
        <h1>
          Smart <span className="accent">Packing List</span>
        </h1>
        <p>Select your trip and we'll generate a personalized packing checklist</p>
      </motion.div>

      {/* Controls */}
      <div className="packing__controls">
        <div className="packing__control-group">
          <label>Select Trip</label>
          <select
            value={selectedTrip}
            onChange={(e) => {
              setSelectedTrip(e.target.value);
              setCheckedItems({});
            }}
          >
            <option value="">— Choose a destination —</option>
            {itineraries.map((it) => (
              <option key={it.id} value={it.id}>
                {it.destination} ({it.dates})
              </option>
            ))}
          </select>
        </div>

        <div className="packing__control-group">
          <label>Expected Weather</label>
          <div className="packing__weather-chips">
            {[
              { value: "hot", icon: "☀️", label: "Hot" },
              { value: "cold", icon: "❄️", label: "Cold" },
              { value: "rainy", icon: "🌧️", label: "Rainy" },
            ].map((w) => (
              <button
                key={w.value}
                className={`packing__weather-chip ${weather === w.value ? "packing__weather-chip--active" : ""}`}
                onClick={() => setWeather(w.value)}
              >
                {w.icon} {w.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="packing__progress-area">
        <div className="packing__progress-bar">
          <motion.div
            className="packing__progress-fill"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
        <div className="packing__progress-info">
          <span>{checkedCount} / {totalItems} items packed</span>
          <span className="packing__progress-pct">{progress}%</span>
        </div>
        <div className="packing__progress-actions">
          <button onClick={saveList}>💾 Save</button>
          <button onClick={loadList}>📂 Load</button>
        </div>
      </div>

      {/* Categories */}
      <div className="packing__grid">
        {Object.entries(categories).map(([key, cat]) => (
          <motion.div
            key={key}
            className="packing__category"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h3>
              <span className="packing__category-icon">{cat.icon}</span>
              {cat.label}
              <span className="packing__category-count">
                {cat.items.filter((item) => checkedItems[`${key}_${item}`]).length}/{cat.items.length}
              </span>
            </h3>
            <div className="packing__items">
              {cat.items.map((item) => {
                const itemKey = `${key}_${item}`;
                const isChecked = checkedItems[itemKey];
                return (
                  <label
                    key={itemKey}
                    className={`packing__item ${isChecked ? "packing__item--checked" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked || false}
                      onChange={() => toggleItem(itemKey)}
                    />
                    <span className="packing__checkbox">
                      {isChecked && "✓"}
                    </span>
                    <span className="packing__item-text">{item}</span>
                  </label>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>

      {trip && (
        <div className="packing__trip-note">
          <p>
            📍 Packing for <strong>{trip.destination}</strong> • {trip.duration} •{" "}
            {trip.difficulty} difficulty
            {trip.bestSeason && ` • Best season: ${trip.bestSeason}`}
          </p>
        </div>
      )}
    </div>
  );
}
