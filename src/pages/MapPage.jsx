import { useItineraries } from "../context/ItineraryContext";
import { useTheme } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useState, useMemo } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "./MapPage.css";

// Fix default marker icon issue with bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const customIcon = new L.Icon({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
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
  { value: "all", label: "All", icon: "🌍" },
  { value: "cultural", label: "Cultural", icon: "🏛️" },
  { value: "trekking", label: "Trekking", icon: "🥾" },
  { value: "beach", label: "Beach", icon: "🏖️" },
];

const PRICE_FILTERS = [
  { value: "all", label: "Any Price" },
  { value: "budget", label: "Under ₹60K", max: 60000 },
  { value: "mid", label: "₹60K - ₹70K", min: 60000, max: 70000 },
  { value: "premium", label: "₹70K+", min: 70000 },
];

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
  if (position) {
    map.flyTo(position, 6, { duration: 1 });
  }
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
    if (activityFilter !== "all") {
      result = result.filter((i) => i.activityType === activityFilter);
    }
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

  // Deduplicate by coordinates for markers
  const uniqueLocations = [];
  const seen = new Set();
  filtered.forEach((item) => {
    const key = `${item.coordinates?.lat},${item.coordinates?.lng}`;
    if (!seen.has(key) && item.coordinates?.lat) {
      seen.add(key);
      uniqueLocations.push(item);
    }
  });

  return (
    <div className="map-page">
      <div className="map-page__header">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Explore Our <span className="accent">Destinations</span>
        </motion.h1>
        <p>Click on any marker to discover your next adventure</p>
      </div>

      {/* Map Filters */}
      <div className="map-page__filters">
        <div className="map-page__filter-group">
          <span className="map-page__filter-label">Activity:</span>
          {ACTIVITY_FILTERS.map((f) => (
            <button
              key={f.value}
              className={`map-page__filter-chip ${activityFilter === f.value ? "map-page__filter-chip--active" : ""}`}
              onClick={() => setActivityFilter(f.value)}
            >
              {f.icon} {f.label}
            </button>
          ))}
        </div>
        <div className="map-page__filter-group">
          <span className="map-page__filter-label">Price:</span>
          {PRICE_FILTERS.map((f) => (
            <button
              key={f.value}
              className={`map-page__filter-chip ${priceFilter === f.value ? "map-page__filter-chip--active" : ""}`}
              onClick={() => setPriceFilter(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="map-page__content">
        <div className="map-page__sidebar">
          {filtered.length === 0 && (
            <div className="map-page__sidebar-empty">
              <p>No destinations match filters</p>
            </div>
          )}
          {filtered.map((item) => (
            <div
              key={item.id}
              className={`map-page__sidebar-card ${
                hoveredId === item.id ? "map-page__sidebar-card--active" : ""
              }`}
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => {
                if (item.coordinates?.lat) {
                  setFlyTo([item.coordinates.lat, item.coordinates.lng]);
                  setTimeout(() => setFlyTo(null), 100);
                }
              }}
            >
              <div
                className="map-page__sidebar-img"
                style={{ backgroundImage: `url(${item.image})` }}
              />
              <div className="map-page__sidebar-info">
                <h4>{item.destination}</h4>
                <span className="map-page__sidebar-dates">{item.dates}</span>
                <div className="map-page__sidebar-row">
                  <span className="map-page__sidebar-price">
                    ₹{item.price?.toLocaleString("en-IN")}
                  </span>
                  {item.difficulty && (
                    <span className={`map-page__sidebar-diff map-page__sidebar-diff--${item.difficulty.toLowerCase()}`}>
                      {item.difficulty}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="map-page__map-container">
          <MapContainer
            center={[15, 100]}
            zoom={4}
            className="map-page__map"
            scrollWheelZoom
          >
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
                    <h4>{item.destination}</h4>
                    <p>{item.dates}</p>
                    <div className="map-page__popup-meta">
                      <span className="map-page__popup-price">
                        ₹{item.price?.toLocaleString("en-IN")}
                      </span>
                      {item.rating && (
                        <span className="map-page__popup-rating">
                          ★ {item.rating}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => navigate(`/destination/${item.id}`)}
                    >
                      View Details
                    </button>
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
