import { useMemo } from "react";
import { useItineraries } from "../context/ItineraryContext";
import "./MarqueeTicker.css";

// Motivational phrases interleaved with real destinations — kept as static
// copy since they're not tied to any data, unlike the destination names.
const PHRASES = ["MAKE MEMORIES", "GO FURTHER", "ADVENTURE AWAITS", "LIFE IS SHORT"];

export default function MarqueeTicker() {
  // `itineraries` (not `getActiveItineraries`, a fresh function reference
  // every render) is the real, stable dependency to memoize on.
  const { itineraries } = useItineraries();
  // Built from the real, live catalog instead of a hardcoded "SRI LANKA /
  // BALI" pair that fell out of date as the catalog grew — see
  // MOCK_DATA_AUDIT.md.
  const ITEMS = useMemo(() => {
    const seen = new Set();
    const destinations = [];
    for (const i of itineraries) {
      if (i.status !== "active" || !i.country || seen.has(i.country)) continue;
      seen.add(i.country);
      destinations.push(i.country.toUpperCase());
    }
    const items = [];
    const max = Math.max(destinations.length, PHRASES.length);
    for (let i = 0; i < max; i++) {
      if (destinations[i]) items.push(destinations[i]);
      if (PHRASES[i]) items.push(PHRASES[i]);
    }
    return items.length ? items : PHRASES;
  }, [itineraries]);

  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker__track">
        <div className="ticker__content">
          {ITEMS.map((item, i) => (
            <span key={i} className="ticker__item">
              {item}
              <span className="ticker__dot">✦</span>
            </span>
          ))}
        </div>
        <div className="ticker__content" aria-hidden="true">
          {ITEMS.map((item, i) => (
            <span key={`dup-${i}`} className="ticker__item">
              {item}
              <span className="ticker__dot">✦</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
