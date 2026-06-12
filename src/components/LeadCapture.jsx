import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Phone } from "lucide-react";
import { useItineraries } from "../context/ItineraryContext";
import "./LeadCapture.css";

const KEY = "infinityHikers_leads";

function saveLead(lead) {
  try {
    const existing = JSON.parse(localStorage.getItem(KEY) || "[]");
    existing.unshift({ ...lead, id: Date.now(), createdAt: new Date().toISOString() });
    localStorage.setItem(KEY, JSON.stringify(existing.slice(0, 200)));
  } catch { /* noop */ }
}

export default function LeadCapture() {
  const { getActiveItineraries } = useItineraries();
  const trips = getActiveItineraries();

  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", trip: "", message: "" });

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    saveLead(form);
    setSubmitted(true);
    setTimeout(() => { setOpen(false); setSubmitted(false); setForm({ name: "", phone: "", trip: "", message: "" }); }, 2600);
  };

  return (
    <>
      {/* Floating trigger */}
      <motion.button
        className="lead-trigger"
        onClick={() => setOpen(true)}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 2, type: "spring" }}
        aria-label="Request a callback"
        title="Get a Callback"
      >
        <Phone size={18} />
        <span>Callback</span>
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="lead-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              className="lead-modal"
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 300, damping: 26 }}
              onClick={e => e.stopPropagation()}
            >
              <button className="lead-close" onClick={() => setOpen(false)}><X size={18} /></button>

              {submitted ? (
                <div className="lead-success">
                  <div className="lead-success__icon">✅</div>
                  <h3>We'll call you back!</h3>
                  <p>Our team will reach out within 2 hours during business hours.</p>
                </div>
              ) : (
                <>
                  <div className="lead-modal__header">
                    <div className="lead-modal__icon">📞</div>
                    <h2>Get a Callback</h2>
                    <p>Leave your details and we'll reach out within 2 hours.</p>
                  </div>

                  <form onSubmit={handleSubmit} className="lead-form">
                    <div className="lead-field">
                      <label>Your Name *</label>
                      <input name="name" value={form.name} onChange={handleChange} placeholder="Priya Sharma" required />
                    </div>
                    <div className="lead-field">
                      <label>Phone Number *</label>
                      <input name="phone" value={form.phone} onChange={handleChange} type="tel" placeholder="+91 98765 43210" required pattern="[0-9+\s\-]{7,15}" />
                    </div>
                    <div className="lead-field">
                      <label>Interested In</label>
                      <select name="trip" value={form.trip} onChange={handleChange}>
                        <option value="">— Any / Not sure yet —</option>
                        {trips.map(t => (
                          <option key={t.id} value={t.id}>{t.destination} ({t.dates})</option>
                        ))}
                      </select>
                    </div>
                    <div className="lead-field">
                      <label>Message (optional)</label>
                      <textarea name="message" value={form.message} onChange={handleChange} rows={2} placeholder="Group size, preferred dates, any questions..." />
                    </div>
                    <button type="submit" className="lead-submit">Request Callback 📲</button>
                  </form>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
