import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useCompare } from "../context/CompareContext";
import { useItineraries } from "../context/ItineraryContext";
import { useNavigate } from "react-router-dom";
import "./CompareModal.css";

const ROWS = [
  { label: "Price", key: (t) => `₹${t.price?.toLocaleString("en-IN")}/person` },
  { label: "Duration", key: (t) => t.duration },
  { label: "Difficulty", key: (t) => t.difficulty || "—" },
  { label: "Rating", key: (t) => t.rating ? `★ ${t.rating} (${t.reviewCount} reviews)` : "—" },
  { label: "Best Season", key: (t) => t.bestSeason || "—" },
  { label: "Includes", key: (t) => t.includes?.join(", ") || "—" },
  { label: "Highlights", key: (t) => t.highlights?.slice(0, 3).join(", ") || "—" },
  { label: "Eco Badges", key: (t) => t.ecoBadges?.join(", ") || "—" },
];

export default function CompareModal({ open, onClose }) {
  const { compareList, clear } = useCompare();
  const { itineraries } = useItineraries();
  const navigate = useNavigate();

  const trips = compareList.map(id => itineraries.find(i => i.id === id)).filter(Boolean);

  const handleView = (id) => { onClose(); navigate(`/destination/${id}`); };

  return (
    <AnimatePresence>
      {open && trips.length === 2 && (
        <motion.div
          className="cmp-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="cmp-modal"
            initial={{ opacity: 0, y: 60, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="cmp-header">
              <h2>Trip Comparison</h2>
              <button className="cmp-close" onClick={onClose}><X size={20} /></button>
            </div>

            <div className="cmp-table">
              {/* Image headers */}
              <div className="cmp-row cmp-row--header">
                <div className="cmp-label" />
                {trips.map(t => (
                  <div key={t.id} className="cmp-cell cmp-cell--hero">
                    <div className="cmp-img" style={{ backgroundImage: `url(${t.image})` }} />
                    <h3>{t.destination}</h3>
                    <p>{t.country}</p>
                  </div>
                ))}
              </div>

              {ROWS.map(row => (
                <div key={row.label} className="cmp-row">
                  <div className="cmp-label">{row.label}</div>
                  {trips.map(t => (
                    <div key={t.id} className="cmp-cell">{row.key(t)}</div>
                  ))}
                </div>
              ))}

              {/* CTA row */}
              <div className="cmp-row cmp-row--cta">
                <div className="cmp-label" />
                {trips.map(t => (
                  <div key={t.id} className="cmp-cell">
                    <button className="cmp-btn" onClick={() => handleView(t.id)}>
                      View Full Details →
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button className="cmp-clear" onClick={() => { clear(); onClose(); }}>
              Clear Comparison
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
