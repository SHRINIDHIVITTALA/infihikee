import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useItineraries } from "../context/ItineraryContext";
import { useTestimonials } from "../context/TestimonialsContext";
import { useSettings } from "../context/SettingsContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Map, MessageSquare, Settings, MessageCircle,
  Edit, Trash2, X, Plus, MapPin, LogOut, Star, Phone, Instagram,
  Mail, Save, ChevronDown, ChevronUp,
} from "lucide-react";
import "./AdminPanel.css";

const SIDEBAR = [
  { id: "dashboard", label: "Dashboard",    icon: LayoutDashboard },
  { id: "tours",     label: "Tours",        icon: Map },
  { id: "testimonials", label: "Testimonials", icon: MessageSquare },
  { id: "settings",  label: "Settings",     icon: Settings },
  { id: "leads",     label: "Leads",        icon: MessageCircle },
];

const MODAL_TABS = ["General", "Content", "Pricing"];

const emptyTourForm = {
  destination: "", country: "", dates: "", startDate: "", endDate: "",
  duration: "", durationDays: "", difficulty: "Easy", activityType: "cultural",
  status: "active", price: "", description: "", highlights: "", includes: "",
};

const emptyTestiForm = {
  name: "", avatar: "", rating: "5", destination: "Singapore", text: "",
};

export default function AdminPanel() {
  const navigate = useNavigate();
  const { itineraries, updateItinerary, deleteItinerary, addItinerary } = useItineraries();
  const { testimonials, addTestimonial, updateTestimonial, deleteTestimonial } = useTestimonials();
  const { settings, updateSettings } = useSettings();

  const [isAuth, setIsAuth]         = useState(false);
  const [password, setPassword]     = useState("");
  const [authError, setAuthError]   = useState("");
  const [activeTab, setActiveTab]   = useState("dashboard");
  const [notification, setNotification] = useState("");

  // Tour form state
  const [showTourForm, setShowTourForm]   = useState(false);
  const [editingTourId, setEditingTourId] = useState(null);
  const [tourForm, setTourForm]           = useState(emptyTourForm);
  const [modalTab, setModalTab]           = useState("General");

  // Testimonial form state
  const [showTestiForm, setShowTestiForm]   = useState(false);
  const [editingTestiId, setEditingTestiId] = useState(null);
  const [testiForm, setTestiForm]           = useState(emptyTestiForm);

  // Settings form state
  const [settingsForm, setSettingsForm] = useState(settings);
  const [settingsSaved, setSettingsSaved] = useState(false);

  const notify = (msg) => { setNotification(msg); setTimeout(() => setNotification(""), 3000); };

  /* ── Auth ── */
  const handleAuth = (e) => {
    e.preventDefault();
    const adminPass = import.meta.env.VITE_ADMIN_PASSWORD || "infinity2026";
    if (password === adminPass) { setIsAuth(true); setAuthError(""); }
    else setAuthError("Incorrect password. Try again.");
  };

  /* ── Tour helpers ── */
  const openNewTour = () => { setEditingTourId(null); setTourForm(emptyTourForm); setModalTab("General"); setShowTourForm(true); };
  const openEditTour = (item) => {
    setEditingTourId(item.id);
    setTourForm({
      destination:  item.destination || "",
      country:      item.country || "",
      dates:        item.dates || "",
      startDate:    item.startDate || "",
      endDate:      item.endDate || "",
      duration:     item.duration || "",
      durationDays: item.durationDays?.toString() || "",
      difficulty:   item.difficulty || "Easy",
      activityType: item.activityType || "cultural",
      status:       item.status || "active",
      price:        item.price?.toString() || "",
      description:  item.description || "",
      highlights:   item.highlights?.join("\n") || "",
      includes:     item.includes?.join("\n") || "",
    });
    setModalTab("General");
    setShowTourForm(true);
  };

  const handleTourChange = (e) => setTourForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleTourSubmit = (e) => {
    e.preventDefault();
    const data = {
      destination:  tourForm.destination,
      country:      tourForm.country,
      dates:        tourForm.dates,
      startDate:    tourForm.startDate,
      endDate:      tourForm.endDate,
      duration:     tourForm.duration,
      durationDays: parseInt(tourForm.durationDays) || 0,
      difficulty:   tourForm.difficulty,
      activityType: tourForm.activityType,
      status:       tourForm.status,
      price:        parseFloat(tourForm.price) || 0,
      description:  tourForm.description,
      highlights:   tourForm.highlights.split("\n").map((s) => s.trim()).filter(Boolean),
      includes:     tourForm.includes.split("\n").map((s) => s.trim()).filter(Boolean),
    };
    if (editingTourId) {
      updateItinerary(editingTourId, data);
      notify(`✅ ${data.destination} updated`);
    } else {
      addItinerary({ ...data, id: `${data.destination.toLowerCase().replace(/\s+/g,"-")}-${Date.now()}` });
      notify(`✅ ${data.destination} added`);
    }
    setShowTourForm(false);
  };

  /* ── Testimonial helpers ── */
  const openNewTesti = () => { setEditingTestiId(null); setTestiForm(emptyTestiForm); setShowTestiForm(true); };
  const openEditTesti = (t) => {
    setEditingTestiId(t.id);
    setTestiForm({ name: t.name, avatar: t.avatar || "", rating: t.rating?.toString() || "5", destination: t.destination, text: t.text });
    setShowTestiForm(true);
  };
  const handleTestiChange = (e) => setTestiForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  const handleTestiSubmit = (e) => {
    e.preventDefault();
    const data = { ...testiForm, rating: parseInt(testiForm.rating) };
    if (editingTestiId) {
      updateTestimonial(editingTestiId, data);
      notify("✅ Testimonial updated");
    } else {
      addTestimonial(data);
      notify("✅ Testimonial added");
    }
    setShowTestiForm(false);
  };

  /* ── Settings helpers ── */
  const handleSettingsChange = (e) => setSettingsForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  const handleSettingsSave = (e) => {
    e.preventDefault();
    updateSettings(settingsForm);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2500);
  };

  /* ── Login screen ── */
  if (!isAuth) {
    return (
      <div className="admin-auth-wrapper">
        <motion.div className="admin-auth-card" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="admin-auth-icon">🔐</div>
          <h2>Admin Access</h2>
          <p className="admin-auth-subtitle">Infinity Hikers management panel</p>
          <form onSubmit={handleAuth}>
            <input className="admin-auth-input" type="password" value={password}
              onChange={(e) => setPassword(e.target.value)} placeholder="Enter admin password" autoFocus />
            {authError && <p className="admin-auth-error">{authError}</p>}
            <button type="submit" className="admin-auth-btn">Unlock Dashboard</button>
          </form>
          <button className="admin-back-btn" onClick={() => navigate("/")}>← Back to Website</button>
        </motion.div>
      </div>
    );
  }

  const activeCount = itineraries.filter((i) => i.status === "active").length;

  return (
    <div className="admin-layout">
      {notification && <div className="admin-notif">{notification}</div>}

      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand">
          <span className="admin-sidebar__logo">IH</span>
          <span>Admin</span>
        </div>
        <nav className="admin-nav">
          {SIDEBAR.map((item) => (
            <button key={item.id}
              className={`admin-nav__item ${activeTab === item.id ? "active" : ""}`}
              onClick={() => setActiveTab(item.id)}
            >
              <item.icon size={17} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <button className="admin-logout-btn" onClick={() => navigate("/")} title="Back to website">
          <LogOut size={16} /> Back to site
        </button>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="admin-mobile-tabs">
        {SIDEBAR.map((item) => (
          <button
            key={item.id}
            className={`admin-mobile-tab ${activeTab === item.id ? "active" : ""}`}
            onClick={() => setActiveTab(item.id)}
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Main */}
      <main className="admin-main">

        {/* ── Dashboard ── */}
        {activeTab === "dashboard" && (
          <div className="admin-section">
            <div className="admin-section__header">
              <h2>Dashboard</h2>
            </div>
            <div className="admin-stats-grid">
              <div className="admin-stat-card">
                <MapPin size={22} className="stat-card__icon" />
                <div>
                  <p className="stat-card__label">Total Tours</p>
                  <h3 className="stat-card__value">{itineraries.length}</h3>
                </div>
              </div>
              <div className="admin-stat-card">
                <Star size={22} className="stat-card__icon" />
                <div>
                  <p className="stat-card__label">Active Tours</p>
                  <h3 className="stat-card__value">{activeCount}</h3>
                </div>
              </div>
              <div className="admin-stat-card">
                <MessageSquare size={22} className="stat-card__icon" />
                <div>
                  <p className="stat-card__label">Testimonials</p>
                  <h3 className="stat-card__value">{testimonials.length}</h3>
                </div>
              </div>
              <div className="admin-stat-card">
                <MessageCircle size={22} className="stat-card__icon" />
                <div>
                  <p className="stat-card__label">Leads</p>
                  <h3 className="stat-card__value">
                    {(() => { try { return JSON.parse(localStorage.getItem("infinityHikers_leads") || "[]").length; } catch { return 0; } })()}
                  </h3>
                </div>
              </div>
            </div>

            <div className="admin-panel-card" style={{ marginTop: "1.5rem" }}>
              <div className="panel-header">
                <h3>All Tours</h3>
                <button className="btn-primary" onClick={() => { setActiveTab("tours"); openNewTour(); }}>
                  <Plus size={14} /> Add Tour
                </button>
              </div>
              <div className="panel-list">
                {itineraries.map((tour) => (
                  <div key={tour.id} className="panel-list-item">
                    <div className="item-details">
                      <h4>{tour.destination}</h4>
                      <p>{tour.dates} · {tour.duration}</p>
                    </div>
                    <div className="item-meta">
                      <span className={`status-badge status-${tour.status}`}>{tour.status}</span>
                      <span className="price">₹{tour.price?.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Tours ── */}
        {activeTab === "tours" && (
          <div className="admin-section">
            <div className="admin-section__header">
              <h2>Tours</h2>
              <button className="btn-primary" onClick={openNewTour}><Plus size={14} /> Add Tour</button>
            </div>
            <div className="records-list">
              {itineraries.map((item) => (
                <div key={item.id} className="record-card">
                  {item.image && (
                    <div className="record-card__img" style={{ backgroundImage: `url(${item.image})` }} />
                  )}
                  <div className="record-info">
                    <div className="record-title-row">
                      <h3>{item.destination}</h3>
                      <span className={`status-badge status-${item.status}`}>{item.status}</span>
                      {item.difficulty && <span className="diff-badge">{item.difficulty}</span>}
                    </div>
                    <div className="record-meta">
                      {item.dates} · {item.duration} · ₹{item.price?.toLocaleString("en-IN")}
                    </div>
                  </div>
                  <div className="record-actions">
                    <button className="icon-btn" onClick={() => openEditTour(item)} title="Edit"><Edit size={15} /></button>
                    <button className="icon-btn btn-danger" onClick={() => {
                      if (window.confirm(`Delete "${item.destination}"?`)) { deleteItinerary(item.id); notify(`🗑️ ${item.destination} deleted`); }
                    }} title="Delete"><Trash2 size={15} /></button>
                    <button
                      className={`btn-toggle ${item.status === "active" ? "btn-toggle--off" : "btn-toggle--on"}`}
                      onClick={() => updateItinerary(item.id, { status: item.status === "active" ? "inactive" : "active" })}
                    >
                      {item.status === "active" ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Testimonials ── */}
        {activeTab === "testimonials" && (
          <div className="admin-section">
            <div className="admin-section__header">
              <h2>Testimonials</h2>
              <button className="btn-primary" onClick={openNewTesti}><Plus size={14} /> Add</button>
            </div>
            <p className="admin-section__hint">Changes here reflect instantly on the homepage testimonials section.</p>
            <div className="records-list">
              {testimonials.map((t) => (
                <div key={t.id} className="record-card">
                  {t.avatar && <img src={t.avatar} alt={t.name} className="record-card__avatar" />}
                  <div className="record-info">
                    <div className="record-title-row">
                      <h3>{t.name}</h3>
                      <span className="diff-badge">{t.destination}</span>
                      <span className="testi-stars">{"★".repeat(t.rating)}</span>
                    </div>
                    <div className="record-meta">"{t.text}"</div>
                  </div>
                  <div className="record-actions">
                    <button className="icon-btn" onClick={() => openEditTesti(t)}><Edit size={15} /></button>
                    <button className="icon-btn btn-danger" onClick={() => { deleteTestimonial(t.id); notify("🗑️ Testimonial removed"); }}><Trash2 size={15} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Settings ── */}
        {activeTab === "settings" && (
          <div className="admin-section">
            <div className="admin-section__header">
              <h2>Settings</h2>
            </div>
            <p className="admin-section__hint">All changes are reflected instantly across the website — footer, chatbot, WhatsApp links, and contact details.</p>
            <form onSubmit={handleSettingsSave} className="settings-form">
              <div className="settings-group">
                <label><Phone size={14} /> WhatsApp Number</label>
                <input name="whatsapp" value={settingsForm.whatsapp}
                  onChange={handleSettingsChange} placeholder="919916258596" />
                <span className="settings-hint">Country code + number, no + or spaces. Used in all WhatsApp links.</span>
              </div>
              <div className="settings-group">
                <label><Phone size={14} /> Phone Display</label>
                <input name="phone" value={settingsForm.phone}
                  onChange={handleSettingsChange} placeholder="+91 99162 58596" />
                <span className="settings-hint">Shown in footer and contact sections.</span>
              </div>
              <div className="settings-group">
                <label><Mail size={14} /> Email</label>
                <input name="email" value={settingsForm.email}
                  onChange={handleSettingsChange} type="email" placeholder="infinityhikers@gmail.com" />
              </div>
              <div className="settings-group">
                <label><Instagram size={14} /> Instagram URL</label>
                <input name="instagram" value={settingsForm.instagram}
                  onChange={handleSettingsChange} placeholder="https://www.instagram.com/infinity.hikers" />
              </div>
              <div className="settings-group">
                <label><Star size={14} /> Tagline</label>
                <input name="tagline" value={settingsForm.tagline}
                  onChange={handleSettingsChange} placeholder="482+ adventurers. Zero regrets." />
                <span className="settings-hint">Shown in footer and testimonials section.</span>
              </div>
              <button type="submit" className={`btn-primary btn-save ${settingsSaved ? "btn-save--done" : ""}`}>
                <Save size={15} /> {settingsSaved ? "Saved!" : "Save Changes"}
              </button>
            </form>
          </div>
        )}

        {/* ── Leads ── */}
        {activeTab === "leads" && (
          <div className="admin-section">
            <div className="admin-section__header">
              <h2>Leads</h2>
              <button className="btn-outline" onClick={() => {
                if (window.confirm("Clear all leads?")) { localStorage.removeItem("infinityHikers_leads"); notify("🗑️ Leads cleared"); window.location.reload(); }
              }}>Clear All</button>
            </div>
            {(() => {
              let leads = [];
              try { leads = JSON.parse(localStorage.getItem("infinityHikers_leads") || "[]"); } catch { leads = []; }
              if (leads.length === 0)
                return <div className="admin-empty"><p>No leads yet. Callback requests from visitors will appear here.</p></div>;
              return (
                <div className="records-list">
                  {leads.map((lead) => (
                    <div key={lead.id} className="record-card">
                      <div className="record-info">
                        <div className="record-title-row">
                          <h3>{lead.name}</h3>
                          <span className="status-badge status-active">new</span>
                        </div>
                        <div className="record-meta">
                          {lead.phone} · {lead.trip || "No trip specified"} · {new Date(lead.createdAt).toLocaleString("en-IN")}
                          {lead.message && <><br />{lead.message}</>}
                        </div>
                      </div>
                      <div className="record-actions">
                        <a className="btn-outline" href={`tel:${lead.phone}`}>Call</a>
                        <a className="btn-primary" href={`https://wa.me/${lead.phone.replace(/\D/g,"")}?text=Hi ${lead.name}, this is Infinity Hikers!`} target="_blank" rel="noreferrer">WhatsApp</a>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}
      </main>

      {/* ── Tour modal ── */}
      <AnimatePresence>
        {showTourForm && (
          <div className="admin-modal-overlay" onClick={() => setShowTourForm(false)}>
            <motion.div className="admin-modal" onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.96, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 16 }}>
              <div className="modal-header">
                <h2>{editingTourId ? "Edit Tour" : "Add Tour"}</h2>
                <button className="close-btn" onClick={() => setShowTourForm(false)}><X size={18} /></button>
              </div>
              <div className="modal-tabs">
                {MODAL_TABS.map((tab) => (
                  <button key={tab} className={`modal-tab ${modalTab === tab ? "active" : ""}`} onClick={() => setModalTab(tab)}>{tab}</button>
                ))}
              </div>
              <form onSubmit={handleTourSubmit} className="modal-body">

                {modalTab === "General" && (
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Destination *</label>
                      <input name="destination" value={tourForm.destination} onChange={handleTourChange} required placeholder="e.g. Bali" />
                    </div>
                    <div className="form-group">
                      <label>Country *</label>
                      <input name="country" value={tourForm.country} onChange={handleTourChange} required placeholder="e.g. Indonesia" />
                    </div>
                    <div className="form-group form-group--full">
                      <label>Travel Dates</label>
                      <input name="dates" value={tourForm.dates} onChange={handleTourChange} placeholder="e.g. May 19 - 26, 2026" />
                    </div>
                    <div className="form-group">
                      <label>Start Date</label>
                      <input name="startDate" type="date" value={tourForm.startDate} onChange={handleTourChange} />
                    </div>
                    <div className="form-group">
                      <label>End Date</label>
                      <input name="endDate" type="date" value={tourForm.endDate} onChange={handleTourChange} />
                    </div>
                    <div className="form-group">
                      <label>Duration Label</label>
                      <input name="duration" value={tourForm.duration} onChange={handleTourChange} placeholder="e.g. 8 Days / 7 Nights" />
                    </div>
                    <div className="form-group">
                      <label>Duration (Days)</label>
                      <input name="durationDays" type="number" min="1" value={tourForm.durationDays} onChange={handleTourChange} placeholder="8" />
                    </div>
                    <div className="form-group">
                      <label>Difficulty</label>
                      <select name="difficulty" value={tourForm.difficulty} onChange={handleTourChange}>
                        <option>Easy</option><option>Moderate</option><option>Hard</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Activity Type</label>
                      <select name="activityType" value={tourForm.activityType} onChange={handleTourChange}>
                        <option value="cultural">Cultural</option>
                        <option value="beach">Beach</option>
                        <option value="trekking">Trekking</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Status</label>
                      <select name="status" value={tourForm.status} onChange={handleTourChange}>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                )}

                {modalTab === "Content" && (
                  <div className="form-grid form-grid--full">
                    <div className="form-group form-group--full">
                      <label>Description</label>
                      <textarea name="description" rows={4} value={tourForm.description} onChange={handleTourChange} placeholder="Describe the trip..." />
                    </div>
                    <div className="form-group">
                      <label>Highlights (one per line)</label>
                      <textarea name="highlights" rows={6} value={tourForm.highlights} onChange={handleTourChange} placeholder={"Marina Bay Sands\nGardens by the Bay\nSentosa Island"} />
                    </div>
                    <div className="form-group">
                      <label>What's Included (one per line)</label>
                      <textarea name="includes" rows={6} value={tourForm.includes} onChange={handleTourChange} placeholder={"4 Star Resort\nAll Meals\nFlight & Visa\nA/C Vehicle\nTour Captain"} />
                    </div>
                  </div>
                )}

                {modalTab === "Pricing" && (
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Price per Person (₹) *</label>
                      <input name="price" type="number" min="0" value={tourForm.price} onChange={handleTourChange} placeholder="54999" required />
                    </div>
                    {tourForm.price && (
                      <div className="form-group">
                        <label>Preview</label>
                        <div className="price-preview">₹{parseFloat(tourForm.price || 0).toLocaleString("en-IN")} <span>/person</span></div>
                      </div>
                    )}
                  </div>
                )}

                <div className="modal-footer">
                  <button type="submit" className="btn-primary">{editingTourId ? "Save Changes" : "Add Tour"}</button>
                  <button type="button" className="btn-outline" onClick={() => setShowTourForm(false)}>Cancel</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Testimonial modal ── */}
      <AnimatePresence>
        {showTestiForm && (
          <div className="admin-modal-overlay" onClick={() => setShowTestiForm(false)}>
            <motion.div className="admin-modal admin-modal--sm" onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.96, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 16 }}>
              <div className="modal-header">
                <h2>{editingTestiId ? "Edit Testimonial" : "Add Testimonial"}</h2>
                <button className="close-btn" onClick={() => setShowTestiForm(false)}><X size={18} /></button>
              </div>
              <form onSubmit={handleTestiSubmit} className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Name *</label>
                    <input name="name" value={testiForm.name} onChange={handleTestiChange} required placeholder="Priya Sharma" />
                  </div>
                  <div className="form-group">
                    <label>Destination</label>
                    <select name="destination" value={testiForm.destination} onChange={handleTestiChange}>
                      {["Singapore","Bhutan","Vietnam","Bali"].map((d) => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Rating</label>
                    <select name="rating" value={testiForm.rating} onChange={handleTestiChange}>
                      {[5,4,3].map((r) => <option key={r} value={r}>{r} stars</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Avatar URL</label>
                    <input name="avatar" value={testiForm.avatar} onChange={handleTestiChange} placeholder="https://i.pravatar.cc/80?img=1" />
                  </div>
                  <div className="form-group form-group--full">
                    <label>Review *</label>
                    <textarea name="text" rows={4} value={testiForm.text} onChange={handleTestiChange} required placeholder="What they said about the trip..." />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="submit" className="btn-primary">{editingTestiId ? "Save" : "Add"}</button>
                  <button type="button" className="btn-outline" onClick={() => setShowTestiForm(false)}>Cancel</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
