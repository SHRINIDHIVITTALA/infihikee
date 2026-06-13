import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useItineraries } from "../context/ItineraryContext";
import { ArrowRight, ArrowLeft, Star } from "lucide-react";
import "./TripPlanner.css";

const CATEGORIES = [
  {
    value: "karnataka",
    label: "Karnataka",
    icon: "🗺️",
    desc: "Coorg, Gokarna, Chikmagalur and more",
    bg: "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=600&auto=format&fit=crop&q=80",
  },
  {
    value: "india",
    label: "India",
    icon: "🇮🇳",
    desc: "Incredible India — north, south, east & west",
    bg: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600&auto=format&fit=crop&q=80",
  },
  {
    value: "international",
    label: "International",
    icon: "✈️",
    desc: "Singapore, Bali, Vietnam, Bhutan & beyond",
    bg: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&auto=format&fit=crop&q=80",
  },
  {
    value: "pilgrim",
    label: "Pilgrim",
    icon: "🛕",
    desc: "Sacred trails & spiritual journeys",
    bg: "https://images.unsplash.com/photo-1598091383021-15ddea10925d?w=600&auto=format&fit=crop&q=80",
  },
];

export default function TripPlanner() {
  const { getActiveItineraries } = useItineraries();
  const itineraries = getActiveItineraries();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(null);

  const recommendations = useMemo(() => {
    if (!selectedCategory) return [];
    return itineraries.filter((item) => {
      const country = (item.country || "").toLowerCase();
      const dest = (item.destination || "").toLowerCase();
      const type = (item.activityType || "").toLowerCase();
      if (selectedCategory === "karnataka")
        return dest.includes("karnataka") || dest.includes("bangalore") || dest.includes("coorg") || dest.includes("gokarna") || dest.includes("chikmagalur");
      if (selectedCategory === "india")
        return country === "india";
      if (selectedCategory === "international")
        return country !== "india";
      if (selectedCategory === "pilgrim")
        return type.includes("pilgrim") || dest.includes("temple") || dest.includes("kashi") || dest.includes("kedarnath");
      return true;
    });
  }, [selectedCategory, itineraries]);

  const selectedCat = CATEGORIES.find(c => c.value === selectedCategory);

  return (
    <div className="planner">
      <div className="planner__grain" />
      <div className="planner__orb planner__orb--1" />
      <div className="planner__orb planner__orb--2" />

      {/* Hero header */}
      <div className="container planner__header">
        <motion.span
          className="planner__eyebrow"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Quick Curations
        </motion.span>
        <motion.h1
          className="planner__title"
          initial={{ opacity: 0, y: 50, clipPath: "inset(100% 0 0 0)" }}
          animate={{ opacity: 1, y: 0, clipPath: "inset(0% 0 0 0)" }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          PLAN YOUR TRIP
        </motion.h1>
        <motion.p
          className="planner__sub"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          Select a category to get personalized destination recommendations instantly
        </motion.p>
      </div>

      <div className="container planner__body">
        <AnimatePresence mode="wait">
          {!selectedCategory ? (
            /* ── Category selection ── */
            <motion.div
              key="categories"
              className="planner__categories"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.45 }}
            >
              <p className="planner__question">Where do you want to explore?</p>
              <div className="planner__cat-grid">
                {CATEGORIES.map((cat, i) => (
                  <motion.button
                    key={cat.value}
                    className="planner__cat"
                    onClick={() => setSelectedCategory(cat.value)}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.09, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    whileHover={{ y: -6 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <div
                      className="planner__cat-bg"
                      style={{ backgroundImage: `url(${cat.bg})` }}
                    />
                    <div className="planner__cat-overlay" />
                    <div className="planner__cat-content">
                      <span className="planner__cat-icon">{cat.icon}</span>
                      <strong className="planner__cat-label">{cat.label}</strong>
                      <span className="planner__cat-desc">{cat.desc}</span>
                      <span className="planner__cat-arrow">Explore →</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            /* ── Results ── */
            <motion.div
              key="results"
              className="planner__results"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <div className="planner__results-header">
                <div>
                  <span className="planner__results-cat">
                    {selectedCat?.icon} {selectedCat?.label}
                  </span>
                  <h2 className="planner__results-title">
                    {recommendations.length > 0
                      ? "Trips we picked for you"
                      : "More coming soon!"}
                  </h2>
                  {recommendations.length === 0 && (
                    <p className="planner__results-empty">
                      We're adding more trips for this category. Check back soon!
                    </p>
                  )}
                </div>
                <button className="planner__back" onClick={() => setSelectedCategory(null)}>
                  <ArrowLeft size={16} /> Change Category
                </button>
              </div>

              <div className="planner__results-grid">
                {recommendations.map((item, i) => (
                  <motion.div
                    key={item.id}
                    className="planner__card"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08, duration: 0.45 }}
                    onClick={() => navigate(`/destination/${item.id}`)}
                    whileHover={{ y: -6 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <div className="planner__card-img" style={{ backgroundImage: `url(${item.image})` }}>
                      <div className="planner__card-gradient" />
                      <div className="planner__card-rec">Recommended</div>
                      {item.difficulty && (
                        <span className={`planner__card-diff planner__card-diff--${item.difficulty.toLowerCase()}`}>
                          {item.difficulty}
                        </span>
                      )}
                    </div>
                    <div className="planner__card-body">
                      <h3 className="planner__card-title">{item.destination}</h3>
                      <div className="planner__card-meta">
                        <span>{item.duration}</span>
                        {item.bestSeason && <span>Best: {item.bestSeason}</span>}
                      </div>
                      <div className="planner__card-footer">
                        <span className="planner__card-price">
                          ₹{item.price?.toLocaleString("en-IN")}
                        </span>
                        {item.rating && (
                          <span className="planner__card-rating">
                            <Star size={11} fill="#fbbf24" stroke="none" /> {item.rating}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="planner__results-actions">
                <button className="planner__back" onClick={() => setSelectedCategory(null)}>
                  <ArrowLeft size={15} /> Change Category
                </button>
                <button className="planner__browse" onClick={() => navigate("/destinations")}>
                  Browse All Destinations <ArrowRight size={15} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
