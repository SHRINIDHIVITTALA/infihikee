import { useState, useMemo, useRef } from "react";
import { useItineraries } from "../context/ItineraryContext";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import TiltCard from "../components/TiltCard";
import TextReveal from "../components/TextReveal";
import "./DestinationsPage.css";

const ACTIVITY_TYPES = [
  { value: "all", label: "All Types", icon: "🌍" },
  { value: "cultural", label: "Cultural", icon: "🏛️" },
  { value: "trekking", label: "Trekking", icon: "🥾" },
  { value: "beach", label: "Beach", icon: "🏖️" },
];

const DIFFICULTY_LEVELS = ["All", "Easy", "Moderate", "Challenging"];

const SORT_OPTIONS = [
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "duration-asc", label: "Duration: Short to Long" },
  { value: "duration-desc", label: "Duration: Long to Short" },
  { value: "rating-desc", label: "Rating: Highest First" },
];

function StarRating({ rating, count }) {
  return (
    <div className="dest-card__rating">
      <span className="dest-card__rating-star">★</span>
      <span className="dest-card__rating-value">{rating}</span>
      {count && <span className="dest-card__rating-count">({count})</span>}
    </div>
  );
}

export default function DestinationsPage() {
  const { getActiveItineraries } = useItineraries();
  const itineraries = getActiveItineraries();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [activity, setActivity] = useState("all");
  const [difficulty, setDifficulty] = useState("All");
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [sortBy, setSortBy] = useState("price-asc");
  const [showFilters, setShowFilters] = useState(false);
  const [quickViewId, setQuickViewId] = useState(null);
  const searchRef = useRef(null);

  const maxPrice = useMemo(
    () => Math.max(...itineraries.map((i) => i.price || 0), 100000),
    [itineraries]
  );

  const filtered = useMemo(() => {
    let result = [...itineraries];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (i) =>
          i.destination?.toLowerCase().includes(q) ||
          i.country?.toLowerCase().includes(q) ||
          i.description?.toLowerCase().includes(q)
      );
    }

    if (activity !== "all") {
      result = result.filter((i) => i.activityType === activity);
    }

    if (difficulty !== "All") {
      result = result.filter((i) => i.difficulty === difficulty);
    }

    result = result.filter(
      (i) => (i.price || 0) >= priceRange[0] && (i.price || 0) <= priceRange[1]
    );

    result.sort((a, b) => {
      switch (sortBy) {
        case "price-asc": return (a.price || 0) - (b.price || 0);
        case "price-desc": return (b.price || 0) - (a.price || 0);
        case "duration-asc": return (a.durationDays || 0) - (b.durationDays || 0);
        case "duration-desc": return (b.durationDays || 0) - (a.durationDays || 0);
        case "rating-desc": return (b.rating || 0) - (a.rating || 0);
        default: return 0;
      }
    });

    return result;
  }, [itineraries, search, activity, difficulty, priceRange, sortBy]);

  const quickViewItem = quickViewId
    ? itineraries.find((i) => i.id === quickViewId)
    : null;

  const activeFilterCount = [
    activity !== "all",
    difficulty !== "All",
    priceRange[0] > 0 || priceRange[1] < maxPrice,
  ].filter(Boolean).length;

  return (
    <div className="destinations">
      <div className="destinations__hero">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          All <span className="accent">Destinations</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
        >
          Choose your next adventure from our curated collection
        </motion.p>
      </div>

      {/* Search & Filter Bar */}
      <div className="destinations__toolbar">
        <div className="destinations__search-wrap">
          <span className="destinations__search-icon">🔍</span>
          <input
            ref={searchRef}
            type="text"
            placeholder="Search destinations, countries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="destinations__search"
          />
          {search && (
            <button className="destinations__search-clear" onClick={() => setSearch("")}>
              ✕
            </button>
          )}
        </div>

        <div className="destinations__toolbar-right">
          <button
            className={`destinations__filter-toggle ${showFilters ? "destinations__filter-toggle--active" : ""}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            ⚙️ Filters
            {activeFilterCount > 0 && (
              <span className="destinations__filter-count">{activeFilterCount}</span>
            )}
          </button>

          <select
            className="destinations__sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Collapsible Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            className="destinations__filters"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="destinations__filters-inner">
              <div className="destinations__filter-group">
                <label>Activity Type</label>
                <div className="destinations__activity-chips">
                  {ACTIVITY_TYPES.map((a) => (
                    <button
                      key={a.value}
                      className={`destinations__chip ${activity === a.value ? "destinations__chip--active" : ""}`}
                      onClick={() => setActivity(a.value)}
                    >
                      {a.icon} {a.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="destinations__filter-group">
                <label>Difficulty</label>
                <div className="destinations__difficulty-chips">
                  {DIFFICULTY_LEVELS.map((d) => (
                    <button
                      key={d}
                      className={`destinations__chip destinations__chip--diff ${difficulty === d ? "destinations__chip--active" : ""}`}
                      onClick={() => setDifficulty(d)}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div className="destinations__filter-group">
                <label>
                  Price Range: ₹{priceRange[0].toLocaleString("en-IN")} — ₹{priceRange[1].toLocaleString("en-IN")}
                </label>
                <div className="destinations__price-slider">
                  <input
                    type="range" min={0} max={maxPrice} step={1000}
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([Math.min(Number(e.target.value), priceRange[1] - 1000), priceRange[1]])}
                    className="destinations__range"
                  />
                  <input
                    type="range" min={0} max={maxPrice} step={1000}
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Math.max(Number(e.target.value), priceRange[0] + 1000)])}
                    className="destinations__range"
                  />
                </div>
              </div>

              <button
                className="destinations__clear-filters"
                onClick={() => { setActivity("all"); setDifficulty("All"); setPriceRange([0, maxPrice]); setSearch(""); }}
              >
                Clear All Filters
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="destinations__results-info">
        <span>{filtered.length} destination{filtered.length !== 1 ? "s" : ""} found</span>
      </div>

      <div className="destinations__grid">
        <AnimatePresence mode="popLayout">
          {filtered.map((item, i) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <TiltCard className="destinations__card" onClick={() => navigate(`/destination/${item.id}`)}>
                <div className="destinations__card-img" style={{ backgroundImage: `url(${item.image})` }}>
                  <div className="destinations__card-img-overlay" />
                  <span className="destinations__card-badge">{item.dates}</span>
                  {item.difficulty && (
                    <span className={`destinations__card-diff destinations__card-diff--${item.difficulty?.toLowerCase()}`}>
                      {item.difficulty}
                    </span>
                  )}
                  {item.bestSeason && (
                    <span className="destinations__card-season">🗓️ Best: {item.bestSeason}</span>
                  )}
                  <button
                    className="destinations__quick-view"
                    onClick={(e) => { e.stopPropagation(); setQuickViewId(item.id); }}
                  >
                    Quick View
                  </button>
                </div>
                <div className="destinations__card-body">
                  <div className="destinations__card-top-row">
                    <div>
                      <h3>{item.destination}</h3>
                      <p className="destinations__card-country">{item.country}</p>
                    </div>
                    {item.rating && <StarRating rating={item.rating} count={item.reviewCount} />}
                  </div>
                  <p className="destinations__card-desc">{item.description?.substring(0, 120)}...</p>
                  {item.activityType && (
                    <span className="destinations__card-activity">
                      {ACTIVITY_TYPES.find((a) => a.value === item.activityType)?.icon}{" "}
                      {ACTIVITY_TYPES.find((a) => a.value === item.activityType)?.label}
                    </span>
                  )}
                  <div className="destinations__card-footer">
                    <div>
                      <span className="destinations__card-price">₹{item.price?.toLocaleString("en-IN")}</span>
                      <span className="destinations__card-duration">{item.duration}</span>
                    </div>
                    <span className="destinations__card-cta">View →</span>
                  </div>
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="destinations__empty">
          <h3>No destinations match your filters</h3>
          <p>Try adjusting your search or filter criteria</p>
          <button
            className="destinations__empty-btn"
            onClick={() => { setSearch(""); setActivity("all"); setDifficulty("All"); setPriceRange([0, maxPrice]); }}
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Quick View Modal */}
      <AnimatePresence>
        {quickViewItem && (
          <motion.div
            className="destinations__modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setQuickViewId(null)}
          >
            <motion.div
              className="destinations__modal"
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="destinations__modal-close" onClick={() => setQuickViewId(null)}>✕</button>
              <div className="destinations__modal-img" style={{ backgroundImage: `url(${quickViewItem.image})` }}>
                <div className="destinations__modal-img-overlay" />
                <div className="destinations__modal-img-content">
                  <h2>{quickViewItem.destination}</h2>
                  <span>{quickViewItem.country}</span>
                </div>
              </div>
              <div className="destinations__modal-body">
                <div className="destinations__modal-meta">
                  <div className="destinations__modal-meta-item">
                    <span className="destinations__modal-meta-label">Dates</span>
                    <span>{quickViewItem.dates}</span>
                  </div>
                  <div className="destinations__modal-meta-item">
                    <span className="destinations__modal-meta-label">Duration</span>
                    <span>{quickViewItem.duration}</span>
                  </div>
                  <div className="destinations__modal-meta-item">
                    <span className="destinations__modal-meta-label">Difficulty</span>
                    <span>{quickViewItem.difficulty || "—"}</span>
                  </div>
                  <div className="destinations__modal-meta-item">
                    <span className="destinations__modal-meta-label">Rating</span>
                    <span>★ {quickViewItem.rating || "—"}</span>
                  </div>
                </div>
                <p>{quickViewItem.description}</p>
                {quickViewItem.highlights && (
                  <div className="destinations__modal-highlights">
                    {quickViewItem.highlights.slice(0, 4).map((h, i) => (
                      <span key={i} className="destinations__modal-tag">✦ {h}</span>
                    ))}
                  </div>
                )}
                <div className="destinations__modal-footer">
                  <span className="destinations__modal-price">
                    ₹{quickViewItem.price?.toLocaleString("en-IN")}<small>/person</small>
                  </span>
                  <button
                    className="destinations__modal-btn"
                    onClick={() => { setQuickViewId(null); navigate(`/destination/${quickViewItem.id}`); }}
                  >
                    View Full Details →
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
