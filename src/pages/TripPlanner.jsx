import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useItineraries } from "../context/ItineraryContext";
import "./TripPlanner.css";

const QUESTIONS = [
  {
    id: "vibe",
    question: "What's your travel vibe?",
    subtitle: "Pick the style that excites you most",
    options: [
      { value: "adventure", label: "Adventure & Adrenaline", icon: "🧗", tags: ["trekking"] },
      { value: "culture", label: "Culture & Heritage", icon: "🏛️", tags: ["cultural"] },
      { value: "relax", label: "Relax & Unwind", icon: "🏖️", tags: ["beach"] },
      { value: "photo", label: "Photography & Scenic", icon: "📸", tags: ["cultural", "trekking"] },
    ],
  },
  {
    id: "budget",
    question: "What's your budget range?",
    subtitle: "Per person, all-inclusive",
    options: [
      { value: "low", label: "Under ₹60,000", icon: "💰", max: 60000 },
      { value: "mid", label: "₹60,000 – ₹70,000", icon: "💳", min: 60000, max: 70000 },
      { value: "high", label: "₹70,000+", icon: "💎", min: 70000 },
    ],
  },
  {
    id: "difficulty",
    question: "How active do you want to be?",
    subtitle: "Your fitness comfort zone",
    options: [
      { value: "easy", label: "Easy & Relaxed", icon: "🚶", diff: "Easy" },
      { value: "moderate", label: "Moderate Hikes", icon: "🥾", diff: "Moderate" },
      { value: "challenging", label: "Challenging Treks", icon: "⛰️", diff: "Challenging" },
    ],
  },
  {
    id: "duration",
    question: "How many days can you spare?",
    subtitle: "Select your ideal trip length",
    options: [
      { value: "short", label: "3–5 days", icon: "⚡", max: 5 },
      { value: "medium", label: "6–8 days", icon: "📅", min: 6, max: 8 },
      { value: "long", label: "9+ days", icon: "🗓️", min: 9 },
    ],
  },
  {
    id: "season",
    question: "When are you planning to travel?",
    subtitle: "Best seasons vary by destination",
    options: [
      { value: "jan-mar", label: "Jan – Mar", icon: "❄️", months: [1, 2, 3] },
      { value: "apr-jun", label: "Apr – Jun", icon: "🌸", months: [4, 5, 6] },
      { value: "jul-sep", label: "Jul – Sep", icon: "☀️", months: [7, 8, 9] },
      { value: "oct-dec", label: "Oct – Dec", icon: "🍂", months: [10, 11, 12] },
    ],
  },
];

function matchScore(item, answers) {
  let score = 0;
  const vibeAnswer = QUESTIONS[0].options.find((o) => o.value === answers.vibe);
  if (vibeAnswer?.tags?.includes(item.activityType)) score += 30;

  const budgetAnswer = QUESTIONS[1].options.find((o) => o.value === answers.budget);
  if (budgetAnswer) {
    const price = item.price || 0;
    const inRange =
      (!budgetAnswer.min || price >= budgetAnswer.min) &&
      (!budgetAnswer.max || price < budgetAnswer.max);
    if (inRange) score += 25;
  }

  const diffAnswer = QUESTIONS[2].options.find((o) => o.value === answers.difficulty);
  if (diffAnswer?.diff === item.difficulty) score += 20;

  const durAnswer = QUESTIONS[3].options.find((o) => o.value === answers.duration);
  if (durAnswer) {
    const days = item.durationDays || 0;
    const inRange =
      (!durAnswer.min || days >= durAnswer.min) &&
      (!durAnswer.max || days <= durAnswer.max);
    if (inRange) score += 15;
  }

  // Season (basic matching)
  if (answers.season && item.bestSeason) {
    score += 10; // base score since all our trips are generally available
  }

  return score;
}

export default function TripPlanner() {
  const { getActiveItineraries } = useItineraries();
  const itineraries = getActiveItineraries();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  const current = QUESTIONS[step];
  const progress = ((step + 1) / QUESTIONS.length) * 100;

  const recommendations = useMemo(() => {
    if (!showResults) return [];
    return itineraries
      .map((item) => ({ ...item, score: matchScore(item, answers) }))
      .sort((a, b) => b.score - a.score);
  }, [showResults, itineraries, answers]);

  const handleSelect = (value) => {
    const newAnswers = { ...answers, [current.id]: value };
    setAnswers(newAnswers);

    if (step < QUESTIONS.length - 1) {
      setTimeout(() => setStep(step + 1), 300);
    } else {
      setTimeout(() => setShowResults(true), 300);
    }
  };

  const restart = () => {
    setStep(0);
    setAnswers({});
    setShowResults(false);
  };

  return (
    <div className="planner">
      <div className="planner__bg-orb planner__bg-orb--1" />
      <div className="planner__bg-orb planner__bg-orb--2" />

      <motion.div
        className="planner__header"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <span className="planner__badge">🤖 AI-Powered</span>
        <h1>
          Find Your <span className="accent">Perfect Trip</span>
        </h1>
        <p>Answer 5 quick questions and we'll match you with your ideal destination</p>
      </motion.div>

      {!showResults ? (
        <div className="planner__quiz">
          {/* Progress bar */}
          <div className="planner__progress">
            <div className="planner__progress-track">
              <motion.div
                className="planner__progress-fill"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
            <span className="planner__progress-text">
              {step + 1} / {QUESTIONS.length}
            </span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.35 }}
              className="planner__question"
            >
              <h2>{current.question}</h2>
              <p>{current.subtitle}</p>

              <div className="planner__options">
                {current.options.map((opt) => (
                  <motion.button
                    key={opt.value}
                    className={`planner__option ${
                      answers[current.id] === opt.value ? "planner__option--selected" : ""
                    }`}
                    onClick={() => handleSelect(opt.value)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <span className="planner__option-icon">{opt.icon}</span>
                    <span className="planner__option-label">{opt.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {step > 0 && (
            <button className="planner__back" onClick={() => setStep(step - 1)}>
              ← Back
            </button>
          )}
        </div>
      ) : (
        <motion.div
          className="planner__results"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2>Your Personalized Recommendations</h2>
          <p className="planner__results-sub">
            Based on your preferences, here are your best matches:
          </p>

          <div className="planner__results-grid">
            {recommendations.map((item, i) => (
              <motion.div
                key={item.id}
                className="planner__result-card"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => navigate(`/destination/${item.id}`)}
              >
                <div className="planner__result-img" style={{ backgroundImage: `url(${item.image})` }}>
                  <div className="planner__result-match">
                    {item.score}% match
                  </div>
                </div>
                <div className="planner__result-body">
                  <h3>{item.destination}</h3>
                  <div className="planner__result-meta">
                    <span>{item.duration}</span>
                    {item.difficulty && (
                      <span className={`planner__result-diff planner__result-diff--${item.difficulty.toLowerCase()}`}>
                        {item.difficulty}
                      </span>
                    )}
                  </div>
                  <div className="planner__result-footer">
                    <span className="planner__result-price">
                      ₹{item.price?.toLocaleString("en-IN")}
                    </span>
                    {item.rating && (
                      <span className="planner__result-rating">★ {item.rating}</span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="planner__results-actions">
            <button className="planner__restart" onClick={restart}>
              🔄 Retake Quiz
            </button>
            <button className="planner__browse" onClick={() => navigate("/destinations")}>
              Browse All Destinations →
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
