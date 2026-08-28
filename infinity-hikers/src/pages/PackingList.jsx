import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useItineraries } from "../context/ItineraryContext";
import "./PackingList.css";

const UNIVERSAL = {
  documents: {
    label: "Documents & Money",
    icon: "📄",
    items: [
      "Passport (valid 6+ months) + 2 photocopies",
      "Travel insurance documents",
      "Flight tickets — printed & digital",
      "Hotel booking confirmations",
      "Cash + forex / travel card",
      "Emergency contact list",
    ],
  },
  clothing: {
    label: "Clothing",
    icon: "👕",
    items: [
      "Light breathable t-shirts × 4",
      "Comfortable pants / shorts × 3",
      "Underwear × 5",
      "Socks × 4 pairs",
      "Light jacket or hoodie",
      "Comfortable walking shoes",
      "Flip flops or sandals",
    ],
  },
  toiletries: {
    label: "Toiletries",
    icon: "🧴",
    items: [
      "Toothbrush & toothpaste",
      "Shampoo (travel size)",
      "Sunscreen SPF 50+",
      "Deodorant",
      "Moisturiser & lip balm",
      "Hand sanitiser",
      "Wet wipes",
    ],
  },
  health: {
    label: "Health & Safety",
    icon: "💊",
    items: [
      "Personal medications (enough for the full trip)",
      "Basic first aid kit",
      "Motion sickness pills",
      "Insect repellent",
      "ORS sachets",
      "Pain relief (paracetamol / ibuprofen)",
    ],
  },
  tech: {
    label: "Tech & Gadgets",
    icon: "📱",
    items: [
      "Phone & charger",
      "Power bank",
      "Universal travel adapter",
      "Camera / GoPro + memory cards",
      "Earphones",
    ],
  },
};

export default function PackingList() {
  const { getActiveItineraries } = useItineraries();
  const itineraries = getActiveItineraries();
  const [selectedTrip, setSelectedTrip] = useState("");
  const [checkedItems, setCheckedItems] = useState({});

  const trip = itineraries.find((i) => i.id === selectedTrip);

  const categories = useMemo(() => {
    const cats = {};
    if (trip?.packingExtras?.length) {
      cats[`dest_${selectedTrip}`] = {
        label: `${trip.destination} Must-Haves`,
        icon: "📍",
        items: trip.packingExtras,
      };
    }
    return { ...cats, ...UNIVERSAL };
  }, [selectedTrip, trip]);

  const toggleItem = (key) => {
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const totalItems = Object.values(categories).reduce((sum, cat) => sum + cat.items.length, 0);
  const checkedCount = Object.values(checkedItems).filter(Boolean).length;
  const progress = totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0;

  return (
    <div className="packing">
      {/* Header */}
      <div className="packing__hero">
        <motion.div
          className="packing__hero-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <span className="packing__eyebrow">Before you leave</span>
          <h1 className="packing__title">PACKING ESSENTIALS</h1>
          <p className="packing__sub">Select your trip — we'll show exactly what to pack</p>
        </motion.div>
      </div>

      <div className="packing__body">
        {/* Trip selector */}
        <div className="packing__selector-row">
          <div className="packing__selector">
            <label className="packing__selector-label">Select your trip</label>
            <select
              value={selectedTrip}
              onChange={(e) => {
                setSelectedTrip(e.target.value);
                setCheckedItems({});
              }}
              className="packing__select"
            >
              <option value="">— Choose a destination —</option>
              {itineraries.map((it) => (
                <option key={it.id} value={it.id}>
                  {it.destination} · {it.dates}
                </option>
              ))}
            </select>
          </div>

          {/* Progress */}
          <div className="packing__progress-wrap">
            <div className="packing__progress-labels">
              <span>{checkedCount} / {totalItems} packed</span>
              <span className="packing__progress-pct">{progress}%</span>
            </div>
            <div className="packing__progress-bar">
              <motion.div
                className="packing__progress-fill"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>
        </div>

        {trip && (
          <motion.div
            className="packing__trip-banner"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            📍 Packing for <strong>{trip.destination}</strong> &nbsp;·&nbsp; {trip.duration} &nbsp;·&nbsp; {trip.difficulty} difficulty
          </motion.div>
        )}

        {/* Categories */}
        <div className="packing__grid">
          {Object.entries(categories).map(([key, cat], sectionIndex) => {
            const isDestSection = key.startsWith("dest_");
            return (
              <motion.div
                key={key}
                className={`packing__section ${isDestSection ? "packing__section--highlight" : ""}`}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: sectionIndex * 0.06, duration: 0.45 }}
              >
                <h3 className="packing__section-heading">
                  <span>{cat.icon}</span>
                  {cat.label}
                  <span className="packing__section-count">
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
                        <span className="packing__checkbox">{isChecked && "✓"}</span>
                        <span className="packing__item-text">{item}</span>
                      </label>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
