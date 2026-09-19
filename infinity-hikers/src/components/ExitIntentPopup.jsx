import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useLeads } from "../context/LeadsContext";
import "./LeadCapture.css";

const SESSION_KEY = "infinityHikers_exitIntentShown";

// Fires once per browser session when the visitor's mouse leaves through the
// top of the viewport on a tour page — the classic "about to close the tab"
// signal. Desktop-only (there's no mouse to leave on touch devices), which
// is fine: it's a bonus capture on top of the always-visible WhatsApp button
// and Callback trigger, not the primary path.
export default function ExitIntentPopup({ tripId, tripLabel }) {
  const { addLead } = useLeads();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const armedRef = useRef(false);
  const closeTimerRef = useRef(null);

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return;

    // Small delay before arming so a stray cursor move toward the tab bar
    // right after the page loads doesn't fire this instantly.
    const armTimer = setTimeout(() => { armedRef.current = true; }, 4000);

    const handleMouseOut = (e) => {
      if (!armedRef.current) return;
      if (e.clientY > 0 || e.relatedTarget) return;
      setOpen(true);
      sessionStorage.setItem(SESSION_KEY, "1");
      document.removeEventListener("mouseout", handleMouseOut);
    };
    document.addEventListener("mouseout", handleMouseOut);

    return () => {
      clearTimeout(armTimer);
      document.removeEventListener("mouseout", handleMouseOut);
    };
  }, []);

  useEffect(() => () => clearTimeout(closeTimerRef.current), []);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await addLead({
      name: form.name,
      phone: form.phone,
      trip: tripId,
      message: `Requested a free itinerary for ${tripLabel}`,
      source: "exit_intent",
    });
    setSubmitting(false);
    setSubmitted(true);
    closeTimerRef.current = setTimeout(() => setOpen(false), 2400);
  };

  return (
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
            onClick={(e) => e.stopPropagation()}
          >
            <button className="lead-close" onClick={() => setOpen(false)}><X size={18} /></button>

            {submitted ? (
              <div className="lead-success">
                <div className="lead-success__icon">✅</div>
                <h3>Got it!</h3>
                <p>We'll send over a free personalized itinerary shortly.</p>
              </div>
            ) : (
              <>
                <div className="lead-modal__header">
                  <div className="lead-modal__icon">🎒</div>
                  <h2>Wait — before you go!</h2>
                  <p>Get a free personalized itinerary for {tripLabel}, no obligation.</p>
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
                  <button type="submit" className="lead-submit" disabled={submitting}>
                    {submitting ? "Sending…" : "Send Me a Free Itinerary 🎒"}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
