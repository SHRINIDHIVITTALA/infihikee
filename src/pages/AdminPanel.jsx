import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useItineraries } from "../context/ItineraryContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, Users, Database, Map, Hotel, Activity, Mountain, 
  Star, MessageSquare, ShoppingCart, Briefcase, FileText, Settings, 
  Car, LayoutTemplate, MessageCircle, Edit, Trash2, X, Sparkles, Plus,
  MapPin, Calendar, DollarSign, LogOut, Home
} from "lucide-react";
import "./AdminPanel.css";

const SIDEBAR_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "users", label: "Users", icon: Users },
  { id: "master-data", label: "Master Data", icon: Database },
  { id: "tours", label: "Tours", icon: Map },
  { id: "hotels", label: "Hotels", icon: Hotel },
  { id: "activities", label: "Activities", icon: Activity },
  { id: "treks", label: "Treks", icon: Mountain },
  { id: "reviews", label: "Reviews", icon: Star },
  { id: "trek-reviews", label: "Trek Reviews", icon: MessageSquare },
  { id: "bookings", label: "Bookings & Orders", icon: ShoppingCart },
  { id: "corporate", label: "Corporate", icon: Briefcase },
  { id: "trip-policies", label: "Trip Policies", icon: FileText },
  { id: "hotel-policies", label: "Hotel Policies", icon: FileText },
  { id: "testing", label: "Testing", icon: LayoutTemplate },
  { id: "fleet", label: "Fleet Management", icon: Car },
  { id: "cms", label: "CMS Pages", icon: LayoutTemplate },
  { id: "settings", label: "Settings", icon: Settings },
  { id: "leads", label: "Leads / Callbacks", icon: MessageCircle },
];

const MODAL_TABS = ["General", "Content", "Pricing", "Media", "Policies", "SEO"];

const emptyForm = {
  title: "",
  slug: "",
  category: "Adventure Sports",
  location: "",
  difficulty: "Easy",
  status: "Active",
  durationHours: "0",
  durationMinutes: "0",
  // Content tab
  description: "",
  highlights: "",
  includes: "",
  dates: "",
  // Pricing tab
  price: "",
  originalPrice: "",
  currency: "INR",
  // SEO tab
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
};

export default function AdminPanel() {
  const navigate = useNavigate();
  const { itineraries, updateItinerary, deleteItinerary, addItinerary } = useItineraries();

  const [isAuth, setIsAuth] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState("General");
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
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setForm({
      title: item.destination || "",
      slug: (item.destination || "").toLowerCase().replace(/\s+/g, '-'),
      category: item.activityType || "Adventure Sports",
      location: item.country || "India",
      difficulty: item.difficulty || "Easy",
      status: item.status === "active" ? "Active" : "Inactive",
      durationHours: item.durationDays?.toString() || "0",
      durationMinutes: "0",
      // Content
      description: item.description || "",
      highlights: item.highlights?.join("\n") || "",
      includes: item.includes?.join("\n") || "",
      dates: item.dates || "",
      // Pricing
      price: item.price?.toString() || "",
      originalPrice: item.originalPrice?.toString() || "",
      currency: item.currency || "INR",
      // SEO
      metaTitle: `${item.destination} | Book Your Adventure`,
      metaDescription: item.description || "",
      metaKeywords: item.highlights?.join(", ") || "",
    });
    setActiveModalTab("General");
    setShowForm(true);
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteItinerary(id);
      notify(`🗑️ ${name} deleted.`);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      destination: form.title,
      country: form.location,
      difficulty: form.difficulty,
      activityType: form.category,
      status: form.status.toLowerCase(),
      durationDays: parseInt(form.durationHours) || 0,
      // Content
      description: form.description,
      highlights: form.highlights.split("\n").map(s => s.trim()).filter(Boolean),
      includes: form.includes.split("\n").map(s => s.trim()).filter(Boolean),
      dates: form.dates,
      // Pricing
      price: parseFloat(form.price) || 0,
      originalPrice: parseFloat(form.originalPrice) || 0,
      currency: form.currency,
    };

    if (editingId) {
      updateItinerary(editingId, data);
      notify(`✅ ${form.title} updated successfully!`);
    } else {
      addItinerary({ ...data, id: form.slug || Date.now().toString() });
      notify(`✅ ${form.title} added successfully!`);
    }
    setShowForm(false);
  };

  if (!isAuth) {
    return (
      <div className="admin-auth-wrapper">
        <motion.div 
          className="admin-auth-card"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="admin-auth-icon">🔐</div>
          <h2>Admin Access</h2>
          <p className="admin-auth-subtitle">Sign in to manage Infinity Hikers</p>
          <form onSubmit={handleAuth}>
            <input
              className="admin-auth-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
            />
            {authError && <p className="admin-auth-error">{authError}</p>}
            <button type="submit" className="admin-auth-btn">Unlock Dashboard</button>
          </form>
          
          <button className="admin-back-btn" onClick={() => navigate("/")}>
            <Home size={16} /> Back to Website
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      {notification && <div className="admin-notif">{notification}</div>}

      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand">Admin</div>
        <nav className="admin-nav">
          {SIDEBAR_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`admin-nav__item ${activeTab === item.id ? "active" : ""}`}
              onClick={() => setActiveTab(item.id)}
            >
              <item.icon size={18} strokeWidth={activeTab === item.id ? 2.5 : 2} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <button className="admin-chat-btn" onClick={() => navigate("/")} title="Back to Website">
          <LogOut size={22} />
        </button>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {activeTab === "dashboard" && (
          <div className="admin-dashboard">
            <div className="admin-stats-grid">
              <div className="admin-stat-card">
                <div className="stat-info">
                  <h4>Total Tours</h4>
                  <h2>{itineraries.length}</h2>
                  <p>Active destinations</p>
                </div>
                <div className="stat-icon"><MapPin size={20} /></div>
              </div>
              <div className="admin-stat-card">
                <div className="stat-info">
                  <h4>Total Bookings</h4>
                  <h2>25</h2>
                  <p>All time bookings</p>
                </div>
                <div className="stat-icon"><Calendar size={20} /></div>
              </div>
              <div className="admin-stat-card">
                <div className="stat-info">
                  <h4>Total Revenue</h4>
                  <h2>₹15,497</h2>
                  <p>From confirmed bookings</p>
                </div>
                <div className="stat-icon"><DollarSign size={20} /></div>
              </div>
              <div className="admin-stat-card">
                <div className="stat-info">
                  <h4>Total Users</h4>
                  <h2>72</h2>
                  <p>Registered users</p>
                </div>
                <div className="stat-icon"><Users size={20} /></div>
              </div>
            </div>

            <div className="admin-dashboard-split">
              <div className="admin-panel-card">
                <div className="panel-header">
                  <h3>Recent Tours</h3>
                  <button className="btn-secondary" onClick={() => setActiveTab("tours")}>
                    <Plus size={16} /> View All Tours
                  </button>
                </div>
                <div className="panel-list">
                  {itineraries.slice(0, 4).map((tour) => (
                    <div key={tour.id} className="panel-list-item">
                      <div className="item-details">
                        <h4>{tour.destination}</h4>
                        <p>• {tour.durationDays} days</p>
                      </div>
                      <div className="item-meta">
                        <span className={`status-badge ${tour.status}`}>{tour.status}</span>
                        <span className="price">₹{tour.price?.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="admin-panel-card">
                <div className="panel-header">
                  <h3>Recent Bookings</h3>
                </div>
                <div className="panel-list">
                  {/* Mock Bookings */}
                  {[
                    { id: "GP202604140052", title: "Ooty, Coonoor & Kotagiri", user: "Vaishnavi Dipak Gulave", status: "pending", price: "15,998" },
                    { id: "GP202603280050", title: "Wayanad Tour package", user: "Admin", status: "pending", price: "5,899" },
                    { id: "GP202603260048", title: "Kodaikanal Tour Package", user: "Admin", status: "pending", price: "5,999" },
                    { id: "GP202602130044", title: "Gokarna Beach Trek and Camping", user: "Mounica Guntagani", status: "confirmed", price: "8,998" },
                  ].map((booking) => (
                    <div key={booking.id} className="panel-list-item">
                      <div className="item-details">
                        <h4>{booking.id}</h4>
                        <p>{booking.title} • {booking.user}</p>
                      </div>
                      <div className="item-meta">
                        <span className={`status-badge status-${booking.status}`}>{booking.status}</span>
                        <span className="price">₹{booking.price}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "leads" && (
          <div className="admin-list-view">
            <div className="list-header">
              <h2>Callback Requests / Leads</h2>
              <button className="btn-secondary" onClick={() => { localStorage.removeItem("infinityHikers_leads"); window.location.reload(); }}>
                Clear All
              </button>
            </div>
            {(() => {
              let leads = [];
              try { leads = JSON.parse(localStorage.getItem("infinityHikers_leads") || "[]"); } catch { leads = []; }
              if (leads.length === 0) return <div className="placeholder-tab"><p>No leads yet. Callback requests from visitors will appear here.</p></div>;
              return (
                <div className="records-list">
                  {leads.map(lead => (
                    <div key={lead.id} className="record-card">
                      <div className="record-info">
                        <div className="record-title-row">
                          <h3>{lead.name}</h3>
                          <span className="status-badge active">new</span>
                        </div>
                        <div className="record-meta">
                          📞 {lead.phone} &nbsp;|&nbsp;
                          ✈️ {lead.trip || "Not specified"} &nbsp;|&nbsp;
                          🕐 {new Date(lead.createdAt).toLocaleString("en-IN")}
                          {lead.message && <><br />💬 {lead.message}</>}
                        </div>
                      </div>
                      <div className="record-actions">
                        <a className="icon-btn" href={`tel:${lead.phone}`} title="Call now">📞</a>
                        <a className="icon-btn" href={`https://wa.me/${lead.phone.replace(/\D/g, "")}?text=Hi ${lead.name}, this is Infinity Hikers! Thanks for your interest in ${lead.trip || "our trips"}.`} target="_blank" rel="noreferrer" title="WhatsApp">💬</a>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {(activeTab === "tours" || activeTab === "activities" || activeTab === "treks") && (
          <div className="admin-list-view">
            <div className="list-header">
              <h2>Manage {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
              <button 
                className="btn-primary"
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyForm);
                  setShowForm(true);
                }}
              >
                + Add New
              </button>
            </div>

            <div className="records-list">
              {itineraries.map((item) => (
                <div key={item.id} className="record-card">
                  <div className="record-info">
                    <div className="record-title-row">
                      <h3>{item.destination}</h3>
                      <span className={`status-badge ${item.status}`}>{item.status}</span>
                      {item.difficulty && <span className="diff-badge">{item.difficulty.toLowerCase()}</span>}
                    </div>
                    <div className="record-meta">
                      Category: {item.activityType} <br/>
                      Location: {item.country} <br/>
                      Price: ₹{item.price?.toLocaleString()} | Rating: {item.rating} ({item.reviewCount} reviews)
                    </div>
                  </div>
                  <div className="record-actions">
                    <button className="icon-btn" onClick={() => handleEdit(item)}><Edit size={16} /></button>
                    <button className="icon-btn btn-danger" onClick={() => handleDelete(item.id, item.destination)}><Trash2 size={16} /></button>
                    <button 
                      className={`btn-action ${item.status === 'active' ? 'btn-deactivate' : 'btn-activate'}`}
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
      </main>

      {/* Edit Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="admin-modal-overlay">
            <motion.div 
              className="admin-modal"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
            >
              <div className="modal-header">
                <h2>{editingId ? "Edit Activity" : "New Activity"}</h2>
                <button className="close-btn" onClick={() => setShowForm(false)}><X size={20} /></button>
              </div>

              <div className="modal-tabs">
                {MODAL_TABS.map(tab => (
                  <button 
                    key={tab} 
                    className={`modal-tab ${activeModalTab === tab ? "active" : ""}`}
                    onClick={() => setActiveModalTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="modal-body">
                {activeModalTab === "General" && (
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Title *</label>
                      <input name="title" value={form.title} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                      <label>Slug *</label>
                      <input name="slug" value={form.slug} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                      <label>Category</label>
                      <select name="category" value={form.category} onChange={handleChange}>
                        <option value="Water Activities">Water Activities</option>
                        <option value="Adventure Sports">Adventure Sports</option>
                        <option value="City Tours">City Tours</option>
                        <option value="premium">Premium</option>
                        <option value="cultural">Cultural</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Location</label>
                      <input name="location" value={form.location} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                      <label>Difficulty Level</label>
                      <select name="difficulty" value={form.difficulty} onChange={handleChange}>
                        <option value="Easy">Easy</option>
                        <option value="Moderate">Moderate</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Status</label>
                      <select name="status" value={form.status} onChange={handleChange}>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Duration (Hours)</label>
                      <input name="durationHours" type="number" value={form.durationHours} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                      <label>Duration (Minutes)</label>
                      <input name="durationMinutes" type="number" value={form.durationMinutes} onChange={handleChange} />
                    </div>
                  </div>
                )}

                {activeModalTab === "SEO" && (
                  <div className="seo-section">
                    <div className="info-banner">
                      <Sparkles size={18} className="info-icon"/>
                      <p><strong>SEO helps your activity rank higher in search results.</strong> Use AI generation for optimized content. Meta tags appear in Google, keywords help categorization, and schema markup enables rich snippets.</p>
                    </div>
                    
                    <div className="seo-controls">
                      <h3>Search Engine Optimization</h3>
                      <p className="subtext">Control how your activity appears in search results</p>

                      <div className="form-group seo-group">
                        <div className="seo-header-flex">
                          <label>Meta Title</label>
                          <button type="button" className="ai-btn"><Sparkles size={14}/> AI Generate</button>
                        </div>
                        <input name="metaTitle" value={form.metaTitle} onChange={handleChange} />
                        <span className="char-count">{form.metaTitle.length}/60 characters</span>
                      </div>

                      <div className="form-group seo-group">
                        <div className="seo-header-flex">
                          <label>Meta Description</label>
                          <button type="button" className="ai-btn"><Sparkles size={14}/> AI Generate</button>
                        </div>
                        <textarea name="metaDescription" rows={3} value={form.metaDescription} onChange={handleChange} />
                        <span className="char-count">{form.metaDescription.length}/160 characters</span>
                      </div>

                      <div className="form-group seo-group">
                        <div className="seo-header-flex">
                          <label>Meta Keywords</label>
                          <button type="button" className="ai-btn"><Sparkles size={14}/> AI Generate</button>
                        </div>
                        <input name="metaKeywords" value={form.metaKeywords} onChange={handleChange} placeholder="Add keyword and press Enter" />
                      </div>
                    </div>
                  </div>
                )}

                {activeModalTab === "Content" && (
                  <div className="form-grid form-grid--full">
                    <div className="form-group form-group--full">
                      <label>Description</label>
                      <textarea
                        name="description"
                        rows={4}
                        value={form.description}
                        onChange={handleChange}
                        placeholder="Write a compelling trip description..."
                      />
                    </div>
                    <div className="form-group">
                      <label>Highlights (one per line)</label>
                      <textarea
                        name="highlights"
                        rows={5}
                        value={form.highlights}
                        onChange={handleChange}
                        placeholder={"Marina Bay Sands\nGardens by the Bay\nSentosa Island"}
                      />
                    </div>
                    <div className="form-group">
                      <label>What's Included (one per line)</label>
                      <textarea
                        name="includes"
                        rows={5}
                        value={form.includes}
                        onChange={handleChange}
                        placeholder={"4 Star Resort\nAll Meals\nFlight & Visa\nA/C Vehicle\nTour Captain"}
                      />
                    </div>
                    <div className="form-group form-group--full">
                      <label>Travel Dates</label>
                      <input
                        name="dates"
                        value={form.dates}
                        onChange={handleChange}
                        placeholder="e.g. April 12 - 16, 2026"
                      />
                    </div>
                  </div>
                )}

                {activeModalTab === "Pricing" && (
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Price per Person (₹)</label>
                      <input
                        name="price"
                        type="number"
                        value={form.price}
                        onChange={handleChange}
                        placeholder="e.g. 54999"
                        min="0"
                      />
                    </div>
                    <div className="form-group">
                      <label>Original Price (₹) — for strikethrough</label>
                      <input
                        name="originalPrice"
                        type="number"
                        value={form.originalPrice}
                        onChange={handleChange}
                        placeholder="Leave blank if no discount"
                        min="0"
                      />
                    </div>
                    <div className="form-group">
                      <label>Currency</label>
                      <select name="currency" value={form.currency} onChange={handleChange}>
                        <option value="INR">INR (₹)</option>
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                      </select>
                    </div>
                    {form.price && form.originalPrice && parseFloat(form.originalPrice) > parseFloat(form.price) && (
                      <div className="form-group">
                        <label>Discount</label>
                        <div className="discount-preview">
                          {Math.round((1 - parseFloat(form.price) / parseFloat(form.originalPrice)) * 100)}% off
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {!["General", "Content", "Pricing", "SEO"].includes(activeModalTab) && (
                  <div className="placeholder-tab">
                    <p>Settings for {activeModalTab} will be available here.</p>
                  </div>
                )}

                <div className="modal-footer">
                  <button type="submit" className="btn-primary">Update Activity</button>
                  <button type="button" className="btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
