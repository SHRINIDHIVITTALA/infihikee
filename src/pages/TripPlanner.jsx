import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useItineraries } from "../context/ItineraryContext";
import "./TripPlanner.css";

const CATEGORIES = [
  { value: "karnataka", label: "Karnataka", icon: "🗺️" },
  { value: "india", label: "India", icon: "🇮🇳" },
  { value: "international", label: "International", icon: "✈️" },
  { value: "pilgrim", label: "Pilgrim", icon: "🛕" },
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
      
      if (selectedCategory === "karnataka") {
        return dest.includes("karnataka") || dest.includes("bangalore") || dest.includes("coorg") || dest.includes("gokarna") || dest.includes("chikmagalur");
      }
      if (selectedCategory === "india") {
        return country === "india";
      }
      if (selectedCategory === "international") {
        return country !== "india";
      }
      if (selectedCategory === "pilgrim") {
        return type.includes("pilgrim") || dest.includes("temple") || dest.includes("kashi") || dest.includes("kedarnath") || dest.includes("chomukha");
      }
      return true;
    });
  }, [selectedCategory, itineraries]);

  return (
    <div className="planner">
      <div className="planner__bg-orb planner__bg-orb--1" />
      <div className="planner__bg-orb planner__bg-orb--2" />

      <motion.div
        className="planner__header"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <span className="planner__badge">Quick Curations</span>
        <h1>
          Find Your <span className="accent">Perfect Trip</span>
        </h1>
        <p>Select a category to see curated destinations instantly</p>
      </motion.div>

      {!selectedCategory ? (
        <div className="planner__quiz">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35 }}
            className="planner__question"
          >
            <h2>Where do you want to explore?</h2>
            <p>Choose your preferred destination type</p>

            <div className="planner__options">
              {CATEGORIES.map((cat) => (
                <motion.button
                  key={cat.value}
                  className="planner__option"
                  onClick={() => setSelectedCategory(cat.value)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <span className="planner__option-icon">{cat.icon}</span>
                  <span className="planner__option-label">{cat.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      ) : (
        <motion.div
          className="planner__results"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2>Curated Destinations</h2>
          <p className="planner__results-sub">
            {recommendations.length > 0 
              ? `Here are the best trips we found for your selection:`
              : `We are currently adding more trips for this category. Check back soon!`}
          </p>

          <div className="planner__results-grid">
            {recommendations.map((item, i) => (
              <motion.div
                key={item.id}
                className="planner__result-card"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => navigate(`/destination/${item.id}`)}
              >
                <div className="planner__result-img" style={{ backgroundImage: `url(${item.image})` }}>
                  <div className="planner__result-match">Recommended</div>
                </div>
                <div className="planner__result-body">
                  <h3>{item.destination}</h3>
                  <div className="planner__result-meta">
                    <span>{item.duration}</span>
                    {item.difficulty && (
                      <span className={`planner__result-diff planner__result-diff--${item.difficulty.toLowerCase()}`}>
                        {item.difficulty}
                      </span>
                    )}
                  </div>
                  <div className="planner__result-footer">
                    <span className="planner__result-price">
                      ₹{item.price?.toLocaleString("en-IN")}
                    </span>
                    {item.rating && (
                      <span className="planner__result-rating">★ {item.rating}</span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="planner__results-actions">
            <button className="planner__restart" onClick={() => setSelectedCategory(null)}>
              ← Change Category
            </button>
            <button className="planner__browse" onClick={() => navigate("/destinations")}>
              Browse All Destinations →
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
