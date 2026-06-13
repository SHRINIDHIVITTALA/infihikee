import { useState, useMemo, useRef, useCallback } from "react";
import { useItineraries } from "../context/ItineraryContext";
import { useWishlist } from "../context/WishlistContext";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { usePageMeta } from "../hooks/usePageMeta";
import { Star, Search, SlidersHorizontal, X, Heart } from "lucide-react";
import "./DestinationsPage.css";

const ACTIVITY_TYPES = [
  { value: "all", label: "All", icon: "🌍" },
  { value: "cultural", label: "Cultural", icon: "🏛️" },
  { value: "trekking", label: "Trekking", icon: "🥾" },
  { value: "beach", label: "Beach", icon: "🏖️" },
];

const DIFFICULTY_LEVELS = ["All", "Easy", "Moderate", "Challenging"];

const SORT_OPTIONS = [
  { value: "price-asc", label: "Price: Low → High" },
  { value: "price-desc", label: "Price: High → Low" },
  { value: "rating-desc", label: "Rating: Best First" },
  { value: "duration-asc", label: "Duration: Short → Long" },
];

/* ── 3D tilt card (same system as homepage) ── */
function DestCard({ item, navigate, isWished, toggleWish, onQuickView }) {
  const cardRef = useRef(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const springX = useSpring(rawX, { stiffness: 180, damping: 26 });
  const springY = useSpring(rawY, { stiffness: 180, damping: 26 });
  const rotateX = useTransform(springY, [-0.5, 0.5], ["12deg", "-12deg"]);
  const rotateY = useTransform(springX, [-0.5, 0.5], ["-12deg", "12deg"]);

  const [glare, setGlare] = useState({ x: 50, y: 50 });
  const [hovered, setHovered] = useState(false);

  const onMouseMove = useCallback((e) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    rawX.set((e.clientX - rect.left) / rect.width - 0.5);
    rawY.set((e.clientY - rect.top) / rect.height - 0.5);
    setGlare({ x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 });
  }, [rawX, rawY]);

  const onMouseLeave = useCallback(() => {
    rawX.set(0); rawY.set(0); setHovered(false);
  }, [rawX, rawY]);

  return (
    <div className="dc-wrap">
      <motion.div
        ref={cardRef}
        className="dc"
        style={{ rotateX, rotateY }}
        animate={{ boxShadow: hovered ? "0 40px 80px rgba(0,0,0,0.6)" : "0 18px 50px rgba(0,0,0,0.3)" }}
        transition={{ boxShadow: { duration: 0.3 } }}
        onMouseMove={onMouseMove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={onMouseLeave}
        onClick={() => navigate(`/destination/${item.id}`)}
        whileTap={{ scale: 0.985 }}
      >
        <motion.div
          className="dc__image"
          style={{ backgroundImage: `url(${item.image})` }}
          animate={{ scale: hovered ? 1.07 : 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        />
        <div className="dc__gradient" />
        <div
          className={`dc__glare ${hovered ? "dc__glare--on" : ""}`}
          style={{ background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.16) 0%, transparent 58%)` }}
        />

        {/* Top actions */}
        <div className="dc__top">
          <div className="dc__badges">
            {item.difficulty && <span className="dc__badge dc__badge--diff">{item.difficulty}</span>}
            {item.rating && (
              <span className="dc__badge dc__badge--rating">
                <Star size={10} fill="#fbbf24" stroke="none" />{item.rating}
              </span>
            )}
          </div>
          <div className="dc__actions">
            <button
              className={`dc__action ${isWished(item.id) ? "dc__action--wished" : ""}`}
              onClick={e => { e.stopPropagation(); toggleWish(item.id); }}
              aria-label="Save"
            >
              <Heart size={13} fill={isWished(item.id) ? "#f97316" : "none"} stroke={isWished(item.id) ? "#f97316" : "#fff"} />
            </button>
            <button
              className="dc__action"
              onClick={e => { e.stopPropagation(); onQuickView(item.id); }}
              aria-label="Quick view"
            >
              <Search size={13} stroke="#fff" />
            </button>
          </div>
        </div>

        {/* Destination name */}
        <div className="dc__dest">{item.destination.toUpperCase()}</div>

        {/* Bottom content */}
        <motion.div
          className="dc__content"
          animate={{ y: hovered ? 0 : 18, opacity: hovered ? 1 : 0.72 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="dc__meta">
            <span>{item.duration}</span>
            {item.dates && <span>{item.dates}</span>}
          </div>
          <div className="dc__footer">
            <div className="dc__price">
              <span className="dc__price-from">From</span>
              <span className="dc__price-amt">₹{item.price?.toLocaleString("en-IN")}</span>
            </div>
            <span className="dc__cta">View Details →</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

/* ── Page ── */
export default function DestinationsPage() {
  const { getActiveItineraries } = useItineraries();
  const itineraries = getActiveItineraries();
  const navigate = useNavigate();
  const location = useLocation();
  const { toggle: toggleWish, isWished } = useWishlist();

  usePageMeta({ title: "All Destinations", description: "Browse Infinity Hikers group tours — Singapore, Bhutan, Vietnam, Bali and more." });

  const initialQuery = new URLSearchParams(location.search).get("q") || "";
  const [search, setSearch] = useState(initialQuery);
  const [activity, setActivity] = useState("all");
  const [difficulty, setDifficulty] = useState("All");
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [sortBy, setSortBy] = useState("price-asc");
  const [showFilters, setShowFilters] = useState(false);
  const [quickViewId, setQuickViewId] = useState(null);

  const maxPrice = useMemo(
    () => Math.max(...itineraries.map((i) => i.price || 0), 100000),
    [itineraries]
  );

  const filtered = useMemo(() => {
    let result = [...itineraries];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(i =>
        i.destination?.toLowerCase().includes(q) ||
        i.country?.toLowerCase().includes(q) ||
        i.description?.toLowerCase().includes(q)
      );
    }
    if (activity !== "all") result = result.filter(i => i.activityType === activity);
    if (difficulty !== "All") result = result.filter(i => i.difficulty === difficulty);
    result = result.filter(i => (i.price || 0) >= priceRange[0] && (i.price || 0) <= priceRange[1]);
    result.sort((a, b) => {
      switch (sortBy) {
        case "price-asc": return (a.price || 0) - (b.price || 0);
        case "price-desc": return (b.price || 0) - (a.price || 0);
        case "duration-asc": return (a.durationDays || 0) - (b.durationDays || 0);
        case "rating-desc": return (b.rating || 0) - (a.rating || 0);
        default: return 0;
      }
    });
    return result;
  }, [itineraries, search, activity, difficulty, priceRange, sortBy]);

  const quickViewItem = quickViewId ? itineraries.find(i => i.id === quickViewId) : null;
  const activeFilterCount = [activity !== "all", difficulty !== "All", priceRange[0] > 0 || priceRange[1] < maxPrice].filter(Boolean).length;

  return (
    <div className="destinations">
      {/* ── Hero ── */}
      <div className="destinations__hero">
        <div className="destinations__hero-grain" />
        <div className="destinations__hero-orb" />
        <div className="container destinations__hero-content">
          <motion.span
            className="dest-eyebrow"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Curated Adventures
          </motion.span>
          <motion.h1
            className="destinations__hero-title"
            initial={{ opacity: 0, y: 50, clipPath: "inset(100% 0 0 0)" }}
            animate={{ opacity: 1, y: 0, clipPath: "inset(0% 0 0 0)" }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            EXPLORE
          </motion.h1>
          <motion.p
            className="destinations__hero-sub"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Choose your next adventure from our curated collection
          </motion.p>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="destinations__toolbar">
        <div className="container destinations__toolbar-inner">
          <div className="destinations__search-wrap">
            <Search size={16} className="destinations__search-icon" />
            <input
              type="text"
              placeholder="Search destinations..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="destinations__search"
            />
            {search && (
              <button className="destinations__search-clear" onClick={() => setSearch("")}>
                <X size={14} />
              </button>
            )}
          </div>

          <div className="destinations__toolbar-right">
            <button
              className={`destinations__filter-btn ${showFilters ? "destinations__filter-btn--active" : ""}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal size={14} />
              Filters
              {activeFilterCount > 0 && <span className="destinations__filter-count">{activeFilterCount}</span>}
            </button>
            <select className="destinations__sort" value={sortBy} onChange={e => setSortBy(e.target.value)}>
              {SORT_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* ── Collapsible filters ── */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            className="destinations__filters"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="container destinations__filters-inner">
              <div className="destinations__filter-group">
                <span className="destinations__filter-label">Activity</span>
                <div className="destinations__chips">
                  {ACTIVITY_TYPES.map(a => (
                    <button key={a.value}
                      className={`destinations__chip ${activity === a.value ? "destinations__chip--on" : ""}`}
                      onClick={() => setActivity(a.value)}
                    >
                      {a.icon} {a.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="destinations__filter-group">
                <span className="destinations__filter-label">Difficulty</span>
                <div className="destinations__chips">
                  {DIFFICULTY_LEVELS.map(d => (
                    <button key={d}
                      className={`destinations__chip ${difficulty === d ? "destinations__chip--on" : ""}`}
                      onClick={() => setDifficulty(d)}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <div className="destinations__filter-group">
                <span className="destinations__filter-label">
                  Price: ₹{priceRange[0].toLocaleString("en-IN")} — ₹{priceRange[1].toLocaleString("en-IN")}
                </span>
                <div className="destinations__slider-wrap">
                  <input type="range" min={0} max={maxPrice} step={1000} value={priceRange[0]}
                    onChange={e => setPriceRange([Math.min(Number(e.target.value), priceRange[1] - 1000), priceRange[1]])}
                    className="destinations__range"
                  />
                  <input type="range" min={0} max={maxPrice} step={1000} value={priceRange[1]}
                    onChange={e => setPriceRange([priceRange[0], Math.max(Number(e.target.value), priceRange[0] + 1000)])}
                    className="destinations__range"
                  />
                </div>
              </div>
              <button className="destinations__clear-btn"
                onClick={() => { setActivity("all"); setDifficulty("All"); setPriceRange([0, maxPrice]); setSearch(""); }}
              >
                Clear All
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Results info ── */}
      <div className="container destinations__results-info">
        <span>{filtered.length} destination{filtered.length !== 1 ? "s" : ""} found</span>
      </div>

      {/* ── Cards grid ── */}
      <div className="container destinations__grid">
        <AnimatePresence mode="popLayout">
          {filtered.map((item, i) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.45, delay: i * 0.06 }}
            >
              <DestCard
                item={item}
                navigate={navigate}
                isWished={isWished}
                toggleWish={toggleWish}
                onQuickView={setQuickViewId}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="destinations__empty container">
          <h3>No destinations match your filters</h3>
          <p>Try adjusting your search or filter criteria</p>
          <button className="destinations__empty-btn"
            onClick={() => { setSearch(""); setActivity("all"); setDifficulty("All"); setPriceRange([0, maxPrice]); }}
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* ── Quick View Modal ── */}
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
              initial={{ opacity: 0, y: 50, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.96 }}
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
              onClick={e => e.stopPropagation()}
            >
              <button className="destinations__modal-close" onClick={() => setQuickViewId(null)}>
                <X size={18} />
              </button>
              <div className="destinations__modal-img" style={{ backgroundImage: `url(${quickViewItem.image})` }}>
                <div className="destinations__modal-img-overlay" />
                <div className="destinations__modal-img-content">
                  <h2>{quickViewItem.destination}</h2>
                  <span>{quickViewItem.country}</span>
                </div>
              </div>
              <div className="destinations__modal-body">
                <div className="destinations__modal-meta">
                  {[
                    { label: "Dates", val: quickViewItem.dates },
                    { label: "Duration", val: quickViewItem.duration },
                    { label: "Difficulty", val: quickViewItem.difficulty || "—" },
                    { label: "Rating", val: quickViewItem.rating ? `★ ${quickViewItem.rating}` : "—" },
                  ].map(m => (
                    <div key={m.label} className="destinations__modal-meta-item">
                      <span className="destinations__modal-meta-label">{m.label}</span>
                      <span>{m.val}</span>
                    </div>
                  ))}
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
                  <button className="destinations__modal-btn"
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
