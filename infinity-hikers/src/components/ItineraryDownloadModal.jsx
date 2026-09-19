import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useLeads } from "../context/LeadsContext";
import { useSettings } from "../context/SettingsContext";
import { downloadItinerary } from "../utils/itineraryExport";
import "./LeadCapture.css";

// Gates the "Download Itinerary" button on a tour page behind a short lead
// form — the itinerary file only downloads after the visitor's details are
// captured, so a genuinely interested visitor turns into a followable lead
// instead of a free anonymous PDF.
export default function ItineraryDownloadModal({ item, onClose }) {
  const { addLead } = useLeads();
  const { settings } = useSettings();
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const closeTimerRef = useRef(null);

  useEffect(() => () => clearTimeout(closeTimerRef.current), []);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await addLead({
      name: form.name,
      phone: form.phone,
      email: form.email,
      trip: item.id,
      message: `Downloaded the ${item.destination} itinerary`,
      source: "itinerary_download",
    });
    await downloadItinerary(item, settings);
    setSubmitting(false);
    setSubmitted(true);
    closeTimerRef.current = setTimeout(onClose, 2200);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="lead-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="lead-modal"
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 300, damping: 26 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button className="lead-close" onClick={onClose}><X size={18} /></button>

          {submitted ? (
            <div className="lead-success">
              <div className="lead-success__icon">📄</div>
              <h3>Your itinerary is downloading!</h3>
              <p>We've also saved your details — expect a follow-up with more info soon.</p>
            </div>
          ) : (
            <>
              <div className="lead-modal__header">
                <div className="lead-modal__icon">📥</div>
                <h2>Download Itinerary</h2>
                <p>Enter your details to get the full {item.destination} itinerary.</p>
              </div>
              <form onSubmit={handleSubmit} className="lead-form">
                <div className="lead-field">
                  <label>Your Name *</label>
                  <input name="name" value={form.name} onChange={handleChange} placeholder="Priya Sharma" required />
                </div>
                <div className="lead-field">
                  <label>WhatsApp Number *</label>
                  <input name="phone" value={form.phone} onChange={handleChange} type="tel" placeholder="+91 98765 43210" required pattern="[0-9+\s\-]{7,15}" />
                </div>
                <div className="lead-field">
                  <label>Email Address *</label>
                  <input name="email" value={form.email} onChange={handleChange} type="email" placeholder="you@example.com" required />
                </div>
                <button type="submit" className="lead-submit" disabled={submitting}>
                  {submitting ? "Preparing…" : "Download Itinerary 📄"}
                </button>
              </form>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
