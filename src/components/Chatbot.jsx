import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "./Chatbot.css";

const FAQ = [
  { q: "What's included in the trip price?", a: "All our trips include 4-Star accommodation, all meals, flights, visa processing, A/C transport, and a dedicated tour captain. Basically everything except shopping!" },
  { q: "How do I book a trip?", a: "You can reach us on WhatsApp at +91 99162 58596 or call us directly. We'll help you pick the perfect destination and handle everything from there." },
  { q: "Are trips safe for solo travelers?", a: "Absolutely! Most of our groups are a mix of solo travelers, couples, and friend groups. Our tour captains ensure everyone feels welcome and safe." },
  { q: "What's the group size?", a: "We keep our groups between 10-25 people for the perfect balance of social energy and personal experience." },
  { q: "Can I customize my itinerary?", a: "While our group trips follow a set itinerary, we can arrange private/custom trips for groups of 5+. Contact us for details!" },
  { q: "What's the cancellation policy?", a: "Full refund if cancelled 30+ days before departure, 50% refund for 15-30 days, and no refund within 15 days. We recommend travel insurance." },
  { q: "Do you provide travel insurance?", a: "Yes! Travel insurance is available as an add-on for ₹1,999 per person, covering medical emergencies, trip cancellation, and baggage loss." },
  { q: "What about visa processing?", a: "Visa processing is included in the trip price for all destinations. We handle the entire application process — just provide the required documents." },
];

const QUICK_ACTIONS = [
  { label: "🗺️ Browse Trips", action: "navigate", path: "/destinations" },
  { label: "🤖 Trip Planner", action: "navigate", path: "/trip-planner" },
  { label: "💰 Cost Calculator", action: "navigate", path: "/calculator" },
  { label: "📞 Contact Us", action: "call" },
];

function getBotResponse(input) {
  const lower = input.toLowerCase();

  // Price queries
  if (lower.match(/price|cost|how much|budget|expensive|cheap/)) {
    return "Our trips range from ₹54,999 to ₹72,999 per person, all-inclusive. Use our Trip Calculator for a detailed estimate, or check out the AI Trip Planner to find the best match for your budget!";
  }

  // Destination queries
  if (lower.match(/singapore/)) {
    return "Singapore (₹54,999) — 5 days of gardens, culture, and city lights! Includes Marina Bay, Sentosa, Gardens by the Bay, and more. It's our most popular trip! 🇸🇬";
  }
  if (lower.match(/bhutan/)) {
    return "Bhutan trips (₹72,999) run in April & May — experience the mystical Tiger's Nest, Punakha Dzong, and pristine Himalayan landscapes. A truly transformative journey! 🇧🇹";
  }
  if (lower.match(/vietnam/)) {
    return "Vietnam (₹64,999) — explore Ha Long Bay, ancient Hội An, the Cu Chi Tunnels, and vibrant Ho Chi Minh City. Amazing food and culture! 🇻🇳";
  }
  if (lower.match(/bali/)) {
    return "Bali (₹59,999) — beaches, temples, rice terraces, and incredible sunsets. Our top-rated trip with a perfect 5.0 rating! 🇮🇩";
  }
  if (lower.match(/destination|where|trip|travel|go/)) {
    return "We currently offer trips to Singapore, Bhutan (Apr & May), Vietnam, and Bali! Each includes flights, 4-star hotels, meals, visa, and a tour captain. Which one interests you?";
  }

  // Safety
  if (lower.match(/safe|security|danger|risk/)) {
    return "Safety is our #1 priority! All destinations are thoroughly vetted, we have 24/7 emergency support, certified tour captains, and comprehensive travel insurance available. We've had 500+ happy travelers with zero incidents. 🛡️";
  }

  // Group/solo
  if (lower.match(/solo|alone|single|group|friend/)) {
    return "Our group trips are perfect for solo travelers! Most of our travelers come solo and leave with lifelong friends. Groups are typically 10-25 people. 🤝";
  }

  // Booking
  if (lower.match(/book|reserve|sign up|register|join/)) {
    return "Ready to book? 🎉 Contact us on WhatsApp at +91 99162 58596 or call directly. We'll need your name, preferred trip, and any special requirements. A 30% advance secures your spot!";
  }

  // FAQ matching
  for (const faq of FAQ) {
    const keywords = faq.q.toLowerCase().split(" ").filter((w) => w.length > 3);
    const matches = keywords.filter((kw) => lower.includes(kw));
    if (matches.length >= 2) return faq.a;
  }

  // Default
  return "I'd love to help! I can answer questions about our destinations, pricing, what's included, safety, booking process, and more. You can also try our AI Trip Planner quiz for personalized recommendations! 😊";
}

export default function Chatbot() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi there! 👋 I'm your travel assistant. How can I help you plan your next adventure?" },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showFAQ, setShowFAQ] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = (text) => {
    if (!text.trim()) return;
    setShowFAQ(false);
    setMessages((prev) => [...prev, { from: "user", text: text.trim() }]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const response = getBotResponse(text);
      setMessages((prev) => [...prev, { from: "bot", text: response }]);
      setIsTyping(false);
    }, 600 + Math.random() * 800);
  };

  const handleQuickAction = (action) => {
    if (action.action === "navigate") {
      setIsOpen(false);
      navigate(action.path);
    } else if (action.action === "call") {
      window.open("tel:+919916258596");
    }
  };

  return (
    <>
      {/* Floating Trigger */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            className="chatbot__trigger"
            onClick={() => setIsOpen(true)}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Open chat"
          >
            <span className="chatbot__trigger-icon">💬</span>
            <span className="chatbot__trigger-pulse" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="chatbot"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <div className="chatbot__header">
              <div className="chatbot__header-info">
                <div className="chatbot__header-avatar">🤖</div>
                <div>
                  <h4>Travel Assistant</h4>
                  <span className="chatbot__status">
                    <span className="chatbot__status-dot" /> Online
                  </span>
                </div>
              </div>
              <button className="chatbot__close" onClick={() => setIsOpen(false)}>✕</button>
            </div>

            <div className="chatbot__messages">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  className={`chatbot__msg chatbot__msg--${msg.from}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {msg.text}
                </motion.div>
              ))}

              {isTyping && (
                <div className="chatbot__msg chatbot__msg--bot chatbot__typing">
                  <span /><span /><span />
                </div>
              )}

              {/* FAQ suggestions */}
              {showFAQ && (
                <div className="chatbot__faq">
                  <p className="chatbot__faq-label">Common questions:</p>
                  {FAQ.slice(0, 4).map((faq, i) => (
                    <button
                      key={i}
                      className="chatbot__faq-btn"
                      onClick={() => sendMessage(faq.q)}
                    >
                      {faq.q}
                    </button>
                  ))}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            <div className="chatbot__quick">
              {QUICK_ACTIONS.map((a, i) => (
                <button key={i} className="chatbot__quick-btn" onClick={() => handleQuickAction(a)}>
                  {a.label}
                </button>
              ))}
            </div>

            <div className="chatbot__input-area">
              <input
                type="text"
                className="chatbot__input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                placeholder="Ask me anything..."
              />
              <button
                className="chatbot__send"
                onClick={() => sendMessage(input)}
                disabled={!input.trim()}
              >
                ➤
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
