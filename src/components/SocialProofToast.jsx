import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./SocialProofToast.css";

const NAMES = ["Priya", "Rahul", "Ankit", "Sneha", "Karthik", "Divya", "Arjun", "Neha", "Rohan", "Meera", "Vikram", "Pooja", "Siddharth", "Kavya", "Arun", "Riya", "Varun", "Nisha", "Deepak", "Anjali"];
const CITIES = ["Mumbai", "Bengaluru", "Delhi", "Pune", "Hyderabad", "Chennai", "Kolkata", "Ahmedabad", "Jaipur", "Kochi", "Surat", "Nagpur", "Chandigarh", "Coimbatore"];
const DESTINATIONS = ["Singapore", "Bhutan", "Vietnam", "Bali"];
const ACTIONS = [
  "just enquired about",
  "just booked a spot on the",
  "is planning a trip to",
  "just paid advance for",
  "just confirmed their booking for",
];

const EMOJIS = { Singapore: "🇸🇬", Bhutan: "🇧🇹", Vietnam: "🇻🇳", Bali: "🇮🇩" };

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function minsAgo() {
  const m = Math.floor(Math.random() * 55) + 2;
  return m === 1 ? "1 min ago" : `${m} mins ago`;
}

export default function SocialProofToast() {
  const [toast, setToast] = useState(null);

  useEffect(() => {
    let dismissTimer;

    const show = () => {
      const dest = pick(DESTINATIONS);
      setToast({
        id: Date.now(),
        name: pick(NAMES),
        city: pick(CITIES),
        action: pick(ACTIONS),
        destination: dest,
        emoji: EMOJIS[dest],
        time: minsAgo(),
      });
      dismissTimer = setTimeout(() => setToast(null), 5500);
    };

    const firstTimer = setTimeout(show, 9000);
    const interval = setInterval(show, 28000 + Math.random() * 12000);

    return () => {
      clearTimeout(firstTimer);
      clearTimeout(dismissTimer);
      clearInterval(interval);
    };
  }, []);

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.id}
          className="sp-toast"
          initial={{ opacity: 0, x: -80 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -80 }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
          onClick={() => setToast(null)}
          role="status"
          aria-live="polite"
        >
          <div className="sp-toast__avatar">{toast.name[0]}</div>
          <div className="sp-toast__content">
            <p className="sp-toast__name">
              <strong>{toast.name}</strong>
              <span className="sp-toast__city"> from {toast.city}</span>
            </p>
            <p className="sp-toast__action">
              {toast.action}{" "}
              <span className="sp-toast__dest">
                {toast.destination} {toast.emoji}
              </span>
            </p>
            <p className="sp-toast__time">{toast.time}</p>
          </div>
          <span className="sp-toast__live-dot" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
