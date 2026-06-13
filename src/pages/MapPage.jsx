import { useItineraries } from "../context/ItineraryContext";
import { useTheme } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useState, useMemo } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "./MapPage.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const customIcon = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const TILE_URLS = {
  dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  light: "https://{s}.basemaps.cartocdn.com/voyager/{z}/{x}/{y}{r}.png",
};

const ACTIVITY_FILTERS = [
  { value: "all", label: "All" },
  { value: "cultural", label: "Cultural" },
  { value: "trekking", label: "Trekking" },
  { value: "beach", label: "Beach" },
];

const PRICE_FILTERS = [
  { value: "all", label: "Any Price" },
  { value: "budget", label: "Under ₹60K", max: 60000 },
  { value: "mid", label: "₹60K–₹70K", min: 60000, max: 70000 },
  { value: "premium", label: "₹70K+", min: 70000 },
];

const DIFF_COLOR = { easy: "#10b981", moderate: "#f97316", hard: "#ef4444", challenging: "#ef4444" };

function ThemeAwareTiles() {
  const { theme } = useTheme();
  return (
    <TileLayer
      key={theme}
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      url={TILE_URLS[theme]}
    />
  );
}

function FlyToMarker({ position }) {
  const map = useMap();
  if (position) map.flyTo(position, 6, { duration: 1.2 });
  return null;
}

export default function MapPage() {
  const { getActiveItineraries } = useItineraries();
  const itineraries = getActiveItineraries();
  const navigate = useNavigate();
  const [hoveredId, setHoveredId] = useState(null);
  const [activityFilter, setActivityFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [flyTo, setFlyTo] = useState(null);

  const filtered = useMemo(() => {
    let result = [...itineraries];
    if (activityFilter !== "all") result = result.filter((i) => i.activityType === activityFilter);
    if (priceFilter !== "all") {
      const pf = PRICE_FILTERS.find((p) => p.value === priceFilter);
      result = result.filter((i) => {
        const price = i.price || 0;
        if (pf?.min && price < pf.min) return false;
        if (pf?.max && price >= pf.max) return false;
        return true;
      });
    }
    return result;
  }, [itineraries, activityFilter, priceFilter]);

  const uniqueLocations = [];
  const seen = new Set();
  filtered.forEach((item) => {
    const key = `${item.coordinates?.lat},${item.coordinates?.lng}`;
    if (!seen.has(key) && item.coordinates?.lat) {
      seen.add(key);
      uniqueLocations.push(item);
    }
  });

  const flyToItem = (item) => {
    if (item.coordinates?.lat) {
      setFlyTo([item.coordinates.lat, item.coordinates.lng]);
      setTimeout(() => setFlyTo(null), 100);
    }
  };

  return (
    <div className="map-page">
      {/* Header */}
      <div className="map-page__header">
        <motion.div
          className="map-page__header-text"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65 }}
        >
          <span className="map-page__eyebrow">Interactive Map</span>
          <h1 className="map-page__title">EXPLORE DESTINATIONS</h1>
        </motion.div>

        <div className="map-page__filters">
          <div className="map-page__filter-group">
            {ACTIVITY_FILTERS.map((f) => (
              <button
                key={f.value}
                className={`map-page__chip ${activityFilter === f.value ? "map-page__chip--active" : ""}`}
                onClick={() => setActivityFilter(f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="map-page__filter-divider" />
          <div className="map-page__filter-group">
            {PRICE_FILTERS.map((f) => (
              <button
                key={f.value}
                className={`map-page__chip ${priceFilter === f.value ? "map-page__chip--active" : ""}`}
                onClick={() => setPriceFilter(f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="map-page__content">
        {/* Sidebar */}
        <div className="map-page__sidebar">
          {filtered.length === 0 && (
            <div className="map-page__empty">
              <p>No destinations match these filters</p>
            </div>
          )}
          {filtered.map((item, i) => (
            <motion.div
              key={item.id}
              className={`map-page__card ${hoveredId === item.id ? "map-page__card--active" : ""}`}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => flyToItem(item)}
            >
              <div
                className="map-page__card-img"
                style={{ backgroundImage: `url(${item.image})` }}
              />
              <div className="map-page__card-body">
                <div className="map-page__card-top">
                  <h4 className="map-page__card-name">{item.destination}</h4>
                  {item.difficulty && (
                    <span
                      className="map-page__card-diff"
                      style={{ color: DIFF_COLOR[item.difficulty.toLowerCase()] || "#f97316" }}
                    >
                      {item.difficulty}
                    </span>
                  )}
                </div>
                <span className="map-page__card-dates">{item.dates}</span>
                <div className="map-page__card-bottom">
                  <span className="map-page__card-price">
                    ₹{item.price?.toLocaleString("en-IN")}
                  </span>
                  <button
                    className="map-page__card-btn"
                    onClick={(e) => { e.stopPropagation(); navigate(`/destination/${item.id}`); }}
                  >
                    View Trip →
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Map */}
        <div className="map-page__map-wrap">
          <MapContainer center={[15, 100]} zoom={4} className="map-page__map" scrollWheelZoom>
            <ThemeAwareTiles />
            {flyTo && <FlyToMarker position={flyTo} />}
            {uniqueLocations.map((item) => (
              <Marker
                key={item.id}
                position={[item.coordinates.lat, item.coordinates.lng]}
                icon={customIcon}
              >
                <Popup>
                  <div className="map-page__popup">
                    <img src={item.image} alt={item.destination} />
                    <div className="map-page__popup-body">
                      <h4>{item.destination}</h4>
                      <p>{item.dates}</p>
                      <div className="map-page__popup-row">
                        <span className="map-page__popup-price">
                          ₹{item.price?.toLocaleString("en-IN")}
                        </span>
                        {item.rating && (
                          <span className="map-page__popup-rating">★ {item.rating}</span>
                        )}
                      </div>
                      <button onClick={() => navigate(`/destination/${item.id}`)}>
                        View Details
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
