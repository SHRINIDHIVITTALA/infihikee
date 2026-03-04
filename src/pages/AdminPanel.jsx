import { useState } from "react";
import { useItineraries } from "../context/ItineraryContext";
import { motion, AnimatePresence } from "framer-motion";
import "./AdminPanel.css";

const emptyForm = {
  destination: "",
  country: "",
  dates: "",
  startDate: "",
  endDate: "",
  duration: "",
  price: "",
  description: "",
  highlights: "",
  image: "",
  gallery: "",
  coordinates: { lat: "", lng: "" },
};

export default function AdminPanel() {
  const {
    itineraries,
    addItinerary,
    updateItinerary,
    deleteItinerary,
    resetToDefaults,
  } = useItineraries();

  const [isAuth, setIsAuth] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [notification, setNotification] = useState("");

  const ADMIN_PASSWORD = "infinity2026";

  const handleAuth = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuth(true);
      setAuthError("");
    } else {
      setAuthError("Incorrect password. Try again.");
    }
  };

  const notify = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 3000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "lat" || name === "lng") {
      setForm((prev) => ({
        ...prev,
        coordinates: { ...prev.coordinates, [name]: value },
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...form,
      price: Number(form.price),
      highlights: form.highlights
        .split(",")
        .map((h) => h.trim())
        .filter(Boolean),
      includes: [
        "4 Star Resort",
        "All Meals",
        "Flight & Visa",
        "A/C Vehicle",
        "Tour Captain",
      ],
      gallery: form.gallery
        .split(",")
        .map((g) => g.trim())
        .filter(Boolean),
      coordinates: {
        lat: Number(form.coordinates.lat) || 0,
        lng: Number(form.coordinates.lng) || 0,
      },
      status: "active",
    };

    if (editingId) {
      updateItinerary(editingId, data);
      notify(`✅ ${data.destination} updated successfully!`);
    } else {
      addItinerary(data);
      notify(`✅ ${data.destination} added successfully!`);
    }

    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setForm({
      destination: item.destination || "",
      country: item.country || "",
      dates: item.dates || "",
      startDate: item.startDate || "",
      endDate: item.endDate || "",
      duration: item.duration || "",
      price: item.price?.toString() || "",
      description: item.description || "",
      highlights: item.highlights?.join(", ") || "",
      image: item.image || "",
      gallery: item.gallery?.join(", ") || "",
      coordinates: {
        lat: item.coordinates?.lat?.toString() || "",
        lng: item.coordinates?.lng?.toString() || "",
      },
    });
    setShowForm(true);
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteItinerary(id);
      notify(`🗑️ ${name} deleted.`);
    }
  };

  const handleReset = () => {
    if (
      window.confirm(
        "Reset all itineraries to defaults? This will remove any custom entries."
      )
    ) {
      resetToDefaults();
      notify("🔄 Reset to default itineraries.");
    }
  };

  // Auth screen
  if (!isAuth) {
    return (
      <div className="admin">
        <div className="admin__auth">
          <motion.div
            className="admin__auth-card"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="admin__auth-icon">🔐</div>
            <h2>Admin Access</h2>
            <p>Enter password to manage itineraries</p>
            <form onSubmit={handleAuth}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="admin__auth-input"
              />
              {authError && <p className="admin__auth-error">{authError}</p>}
              <button type="submit" className="admin__auth-btn">
                Unlock
              </button>
            </form>
            <p className="admin__auth-hint">
              Default: <code>infinity2026</code>
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin">
      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            className="admin__notif"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {notification}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="admin__header">
        <div>
          <h1>
            Admin <span className="accent">Panel</span>
          </h1>
          <p>Manage your travel itineraries</p>
        </div>
        <div className="admin__header-actions">
          <button
            className="admin__btn admin__btn--primary"
            onClick={() => {
              setShowForm(true);
              setEditingId(null);
              setForm(emptyForm);
            }}
          >
            + Add New Itinerary
          </button>
          <button className="admin__btn admin__btn--ghost" onClick={handleReset}>
            Reset Defaults
          </button>
        </div>
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            className="admin__modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowForm(false)}
          >
            <motion.div
              className="admin__modal"
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="admin__modal-header">
                <h2>{editingId ? "Edit Itinerary" : "New Itinerary"}</h2>
                <button
                  className="admin__modal-close"
                  onClick={() => setShowForm(false)}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="admin__form">
                <div className="admin__form-grid">
                  <div className="admin__field">
                    <label>Destination *</label>
                    <input
                      name="destination"
                      value={form.destination}
                      onChange={handleChange}
                      required
                      placeholder="e.g. Singapore"
                    />
                  </div>
                  <div className="admin__field">
                    <label>Country *</label>
                    <input
                      name="country"
                      value={form.country}
                      onChange={handleChange}
                      required
                      placeholder="e.g. Singapore"
                    />
                  </div>
                  <div className="admin__field">
                    <label>Display Dates *</label>
                    <input
                      name="dates"
                      value={form.dates}
                      onChange={handleChange}
                      required
                      placeholder="e.g. April 12 - 16, 2026"
                    />
                  </div>
                  <div className="admin__field">
                    <label>Duration *</label>
                    <input
                      name="duration"
                      value={form.duration}
                      onChange={handleChange}
                      required
                      placeholder="e.g. 5 Days / 4 Nights"
                    />
                  </div>
                  <div className="admin__field">
                    <label>Start Date</label>
                    <input
                      name="startDate"
                      type="date"
                      value={form.startDate}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="admin__field">
                    <label>End Date</label>
                    <input
                      name="endDate"
                      type="date"
                      value={form.endDate}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="admin__field">
                    <label>Price (INR) *</label>
                    <input
                      name="price"
                      type="number"
                      value={form.price}
                      onChange={handleChange}
                      required
                      placeholder="e.g. 54999"
                    />
                  </div>
                  <div className="admin__field">
                    <label>Latitude</label>
                    <input
                      name="lat"
                      type="number"
                      step="any"
                      value={form.coordinates.lat}
                      onChange={handleChange}
                      placeholder="e.g. 1.3521"
                    />
                  </div>
                  <div className="admin__field">
                    <label>Longitude</label>
                    <input
                      name="lng"
                      type="number"
                      step="any"
                      value={form.coordinates.lng}
                      onChange={handleChange}
                      placeholder="e.g. 103.8198"
                    />
                  </div>
                </div>

                <div className="admin__field">
                  <label>Description *</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    required
                    rows="3"
                    placeholder="Describe the trip..."
                  />
                </div>

                <div className="admin__field">
                  <label>Highlights (comma-separated)</label>
                  <textarea
                    name="highlights"
                    value={form.highlights}
                    onChange={handleChange}
                    rows="2"
                    placeholder="e.g. Marina Bay Sands, Gardens by the Bay, Sentosa Island"
                  />
                </div>

                <div className="admin__field">
                  <label>Main Image URL *</label>
                  <input
                    name="image"
                    value={form.image}
                    onChange={handleChange}
                    required
                    placeholder="https://..."
                  />
                  {form.image && (
                    <img
                      src={form.image}
                      alt="Preview"
                      className="admin__preview"
                      onError={(e) => (e.target.style.display = "none")}
                    />
                  )}
                </div>

                <div className="admin__field">
                  <label>Gallery URLs (comma-separated)</label>
                  <textarea
                    name="gallery"
                    value={form.gallery}
                    onChange={handleChange}
                    rows="2"
                    placeholder="https://..., https://..., https://..."
                  />
                </div>

                <div className="admin__form-actions">
                  <button type="submit" className="admin__btn admin__btn--primary">
                    {editingId ? "Save Changes" : "Add Itinerary"}
                  </button>
                  <button
                    type="button"
                    className="admin__btn admin__btn--ghost"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Itinerary List */}
      <div className="admin__list">
        {itineraries.map((item, i) => (
          <motion.div
            key={item.id}
            className="admin__item"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <div
              className="admin__item-img"
              style={{ backgroundImage: `url(${item.image})` }}
            />
            <div className="admin__item-info">
              <h3>{item.destination}</h3>
              <p className="admin__item-country">{item.country}</p>
              <p className="admin__item-dates">{item.dates}</p>
              <p className="admin__item-price">
                ₹{item.price?.toLocaleString("en-IN")} &bull; {item.duration}
              </p>
            </div>
            <div className="admin__item-status">
              <span
                className={`admin__status-badge admin__status-badge--${item.status}`}
              >
                {item.status}
              </span>
            </div>
            <div className="admin__item-actions">
              <button
                className="admin__action-btn admin__action-btn--edit"
                onClick={() => handleEdit(item)}
              >
                Edit
              </button>
              <button
                className="admin__action-btn admin__action-btn--toggle"
                onClick={() =>
                  updateItinerary(item.id, {
                    status: item.status === "active" ? "inactive" : "active",
                  })
                }
              >
                {item.status === "active" ? "Deactivate" : "Activate"}
              </button>
              <button
                className="admin__action-btn admin__action-btn--delete"
                onClick={() => handleDelete(item.id, item.destination)}
              >
                Delete
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {itineraries.length === 0 && (
        <div className="admin__empty">
          <p>No itineraries yet. Add your first one!</p>
        </div>
      )}
    </div>
  );
}
