import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useItineraries } from "../context/ItineraryContext";
import "./Sustainability.css";

const FLIGHT_EMISSIONS = {
  Singapore: { distance: 3915, co2: 0.62 },  // tonnes CO2 per person round trip
  Bhutan: { distance: 1800, co2: 0.35 },
  Vietnam: { distance: 4200, co2: 0.68 },
  Bali: { distance: 5780, co2: 0.92 },
};

const OFFSET_COST_PER_TONNE = 850; // INR per tonne CO2

const ECO_TIPS = [
  { icon: "🚰", title: "Carry Reusable Bottles", desc: "Skip single-use plastic. We provide filtered water refill stations at hotels." },
  { icon: "🧴", title: "Eco-Friendly Toiletries", desc: "Bring biodegradable sunscreen and shampoo bars to protect marine life." },
  { icon: "🛍️", title: "Say No to Plastic Bags", desc: "Carry a reusable tote for shopping and souvenirs." },
  { icon: "🚶", title: "Walk & Cycle", desc: "Explore neighborhoods on foot — it's the best way to discover hidden gems." },
  { icon: "🍽️", title: "Eat Local", desc: "Support local restaurants and street vendors instead of international chains." },
  { icon: "🏨", title: "Conserve Hotel Resources", desc: "Reuse towels, turn off AC when leaving, and take shorter showers." },
  { icon: "📸", title: "Leave No Trace", desc: "Take only photos, leave only footprints. Don't disturb wildlife or coral." },
  { icon: "💰", title: "Buy Fair Trade", desc: "Purchase souvenirs directly from artisans to ensure fair wages." },
];

const CONSERVATION_PARTNERS = [
  { name: "Clean Bhutan", focus: "Zero waste & environmental conservation in Bhutan", icon: "🏔️" },
  { name: "Vietnam Green Travel", focus: "Sustainable tourism practices across Vietnam", icon: "🌿" },
  { name: "Bali Sea Turtle Society", focus: "Marine conservation & turtle rehabilitation", icon: "🐢" },
  { name: "Singapore Green Plan", focus: "30-by-30 biodiversity & sustainability goals", icon: "🌳" },
];

export default function Sustainability() {
  const { getActiveItineraries } = useItineraries();
  const itineraries = getActiveItineraries();
  const [selectedTrip, setSelectedTrip] = useState("");
  const [travelers, setTravelers] = useState(1);

  const trip = itineraries.find((i) => i.id === selectedTrip);
  const destination = trip?.destination?.split(" ")[0];
  const emissions = destination ? FLIGHT_EMISSIONS[destination] : null;

  const calculation = useMemo(() => {
    if (!emissions) return null;
    const totalCO2 = emissions.co2 * travelers;
    const offsetCost = Math.round(totalCO2 * OFFSET_COST_PER_TONNE);
    const treesNeeded = Math.ceil(totalCO2 / 0.022); // ~22kg per tree per year
    return { totalCO2: totalCO2.toFixed(2), offsetCost, treesNeeded, distance: emissions.distance };
  }, [emissions, travelers]);

  return (
    <div className="sustain">
      <div className="sustain__bg-leaf">🌿</div>

      <motion.div
        className="sustain__header"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <span className="sustain__badge">🌍 Eco-Conscious Travel</span>
        <h1>
          Travel <span className="accent">Responsibly</span>
        </h1>
        <p>We believe in leaving destinations better than we found them</p>
      </motion.div>

      {/* Carbon Calculator */}
      <section className="sustain__section">
        <h2>🌱 Carbon Footprint Calculator</h2>
        <p className="sustain__section-desc">
          Estimate the carbon emissions for your trip and explore offset options
        </p>

        <div className="sustain__calc">
          <div className="sustain__calc-controls">
            <div className="sustain__calc-field">
              <label>Select Trip</label>
              <select value={selectedTrip} onChange={(e) => setSelectedTrip(e.target.value)}>
                <option value="">— Choose destination —</option>
                {itineraries.map((it) => (
                  <option key={it.id} value={it.id}>{it.destination} ({it.dates})</option>
                ))}
              </select>
            </div>
            <div className="sustain__calc-field">
              <label>Travelers</label>
              <input
                type="number"
                min="1"
                max="30"
                value={travelers}
                onChange={(e) => setTravelers(Math.max(1, parseInt(e.target.value) || 1))}
              />
            </div>
          </div>

          {calculation && (
            <motion.div
              className="sustain__calc-result"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              key={selectedTrip + travelers}
            >
              <div className="sustain__calc-cards">
                <div className="sustain__calc-card">
                  <span className="sustain__calc-card-icon">✈️</span>
                  <span className="sustain__calc-card-value">{(calculation.distance * 2).toLocaleString()} km</span>
                  <span className="sustain__calc-card-label">Round trip distance</span>
                </div>
                <div className="sustain__calc-card">
                  <span className="sustain__calc-card-icon">💨</span>
                  <span className="sustain__calc-card-value">{calculation.totalCO2} tonnes</span>
                  <span className="sustain__calc-card-label">CO₂ emissions</span>
                </div>
                <div className="sustain__calc-card">
                  <span className="sustain__calc-card-icon">🌳</span>
                  <span className="sustain__calc-card-value">{calculation.treesNeeded} trees</span>
                  <span className="sustain__calc-card-label">To offset (per year)</span>
                </div>
                <div className="sustain__calc-card sustain__calc-card--accent">
                  <span className="sustain__calc-card-icon">💚</span>
                  <span className="sustain__calc-card-value">₹{calculation.offsetCost.toLocaleString("en-IN")}</span>
                  <span className="sustain__calc-card-label">Offset cost</span>
                </div>
              </div>
              <p className="sustain__calc-note">
                We contribute 2% of every booking to verified carbon offset projects.
                You can opt to offset the full amount during booking.
              </p>
            </motion.div>
          )}
        </div>
      </section>

      {/* Eco Tips */}
      <section className="sustain__section">
        <h2>♻️ Responsible Tourism Guidelines</h2>
        <p className="sustain__section-desc">Simple actions that make a big difference</p>

        <div className="sustain__tips-grid">
          {ECO_TIPS.map((tip, i) => (
            <motion.div
              key={i}
              className="sustain__tip"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <span className="sustain__tip-icon">{tip.icon}</span>
              <h4>{tip.title}</h4>
              <p>{tip.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Conservation Partners */}
      <section className="sustain__section">
        <h2>🤝 Conservation Partners</h2>
        <p className="sustain__section-desc">
          Organizations we proudly support in every destination
        </p>

        <div className="sustain__partners">
          {CONSERVATION_PARTNERS.map((partner, i) => (
            <motion.div
              key={i}
              className="sustain__partner"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <span className="sustain__partner-icon">{partner.icon}</span>
              <div>
                <h4>{partner.name}</h4>
                <p>{partner.focus}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Eco Commitment */}
      <section className="sustain__commitment">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <h2>Our Green Commitment</h2>
          <div className="sustain__commitment-grid">
            <div className="sustain__commitment-item">
              <span>🏨</span>
              <strong>Eco-Certified Hotels</strong>
              <p>All partner hotels meet green certification standards</p>
            </div>
            <div className="sustain__commitment-item">
              <span>🚌</span>
              <strong>Shared Transport</strong>
              <p>Group travel reduces per-person carbon footprint by 60%</p>
            </div>
            <div className="sustain__commitment-item">
              <span>🍃</span>
              <strong>2% Green Fund</strong>
              <p>Every booking contributes to our environmental offset fund</p>
            </div>
            <div className="sustain__commitment-item">
              <span>📋</span>
              <strong>No-Plastic Policy</strong>
              <p>Zero single-use plastics on all Infinity Hikers trips</p>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
