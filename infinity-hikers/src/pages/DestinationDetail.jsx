import { useParams, useNavigate } from "react-router-dom";
import { useItineraries } from "../context/ItineraryContext";
import { useSettings } from "../context/SettingsContext";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import CountdownTimer from "../components/CountdownTimer";
import { usePageMeta } from "../hooks/usePageMeta";
import { formatDDMMYYYY } from "../utils/formatDates";
import { formatMoney } from "../utils/currency";
import "./DestinationDetail.css";

function DayItem({ day, index }) {
  const [open, setOpen] = useState(index === 0);
  return (
    <div className={`itinerary__day ${open ? "itinerary__day--open" : ""}`}>
      <button className="itinerary__day-header" onClick={() => setOpen(!open)}>
        <div className="itinerary__day-num">
          <span>Day</span>
          <strong>{day.day}</strong>
        </div>
        <div className="itinerary__day-title">
          <span>{day.title}</span>
        </div>
        <span className="itinerary__day-chevron">{open ? "▲" : "▼"}</span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            className="itinerary__day-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
          >
            <p>{day.description}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function DestinationDetail() {
  const { id } = useParams();
  const { itineraries } = useItineraries();
  const navigate = useNavigate();
  const { settings, waLink } = useSettings();
  const [selectedImg, setSelectedImg] = useState(0);

  // A deactivated tour must be unreachable by direct link too, not just hidden
  // from the listings — old URLs live on in search results and shared messages
  const item = itineraries.find((i) => i.id === id && i.status === "active");

  usePageMeta({
    title: item ? `${item.destination} Trip` : "Destination",
    description: item?.description,
    image: item?.image,
  });

  // JSON-LD structured data for Google rich results
  useEffect(() => {
    if (!item) return;
    const schema = {
      "@context": "https://schema.org",
      "@type": "TouristTrip",
      "name": item.destination,
      "description": item.description,
      "image": item.image,
      "touristType": item.activityType,
      "offers": {
        "@type": "Offer",
        "price": item.price,
        "priceCurrency": item.currency || "INR",
        "availability": item.seatsLeft <= 5 ? "https://schema.org/LimitedAvailability" : "https://schema.org/InStock",
        "validFrom": item.startDate,
      },
      ...(item.rating && {
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": item.rating,
          "reviewCount": item.reviewCount,
          "bestRating": 5,
        }
      }),
    };
    let el = document.getElementById("ld-json-trip");
    if (!el) { el = document.createElement("script"); el.id = "ld-json-trip"; el.type = "application/ld+json"; document.head.appendChild(el); }
    el.textContent = JSON.stringify(schema);
    return () => { const s = document.getElementById("ld-json-trip"); if (s) s.remove(); };
  }, [item]);

  // Auto-rotate through this tour's own gallery only — resets whenever the tour changes
  useEffect(() => {
    setSelectedImg(0);
    if (!item?.gallery || item.gallery.length < 2) return;
    const timer = setInterval(() => {
      setSelectedImg((i) => (i + 1) % item.gallery.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [item?.id, item?.gallery]);

  if (!item) {
    return (
      <div className="detail__not-found">
        <h2>Destination not found</h2>
        <button onClick={() => navigate("/destinations")}>
          Back to Destinations
        </button>
      </div>
    );
  }

  const seatsUrgent = item.seatsLeft && item.seatsLeft <= 5;

  return (
    <div className="detail">
      {/* Hero */}
      <div className="detail__hero">
        <AnimatePresence mode="sync">
          <motion.div
            key={item.gallery?.[selectedImg] || item.image}
            className="detail__hero-bg"
            style={{ backgroundImage: `url(${item.gallery?.[selectedImg] || item.image})` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          />
        </AnimatePresence>
        <div className="detail__hero-overlay" />
        <motion.div
          className="detail__hero-content"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <button className="detail__back" onClick={() => navigate(-1)}>
            ← Back
          </button>
          <h1 className="detail__title">{item.destination}</h1>
          <p className="detail__country">{item.country}</p>
          {(() => {
            const ddmmyyyy = formatDDMMYYYY(item.startDate, item.endDate);
            const label = ddmmyyyy || item.dates;
            return label ? <span className="detail__dates">{label}</span> : null;
          })()}
          <div className="detail__meta">
            <span>{item.duration}</span>
            {item.difficulty && item.difficulty.toLowerCase() !== "easy" && (
              <span className={`detail__difficulty detail__difficulty--${item.difficulty.toLowerCase()}`}>
                {item.difficulty}
              </span>
            )}
            {item.rating && (
              <span className="detail__rating">★ {item.rating} <small>({item.reviewCount} reviews)</small></span>
            )}
            <span className="detail__price">
              {formatMoney(item.price, settings.currency)}
              <small>/person</small>
            </span>
          </div>

          {/* Seats urgency pill on hero */}
          {item.seatsLeft && (
            <div className={`detail__hero-seats ${seatsUrgent ? "detail__hero-seats--urgent" : ""}`}>
              🔥 Only {item.seatsLeft} seats left — book before it fills up!
            </div>
          )}
        </motion.div>
      </div>

      {/* Gallery */}
      {item.gallery && item.gallery.length > 0 && (
        <div className="detail__gallery">
          {item.gallery.map((img, i) => (
            <div
              key={i}
              className={`detail__gallery-thumb ${selectedImg === i ? "detail__gallery-thumb--active" : ""}`}
              style={{ backgroundImage: `url(${img})` }}
              onClick={() => setSelectedImg(i)}
            />
          ))}
        </div>
      )}

      {/* Content */}
      <div className="detail__body">
        <motion.div
          className="detail__main"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Quick Info Pills */}
          {(item.bestSeason || item.activityType) && (
            <div className="detail__quick-info">
              {item.activityType && (
                <span className="detail__quick-pill">🏷️ {item.activityType}</span>
              )}
              {item.bestSeason && (
                <span className="detail__quick-pill">📅 Best: {item.bestSeason}</span>
              )}
              {item.durationDays && (
                <span className="detail__quick-pill">🗓️ {item.durationDays} Days</span>
              )}
            </div>
          )}

          <section className="detail__section">
            <h2>About This Trip</h2>
            <p>{item.description}</p>
          </section>

          {/* Day-by-Day Itinerary */}
          {item.itinerary && item.itinerary.length > 0 && (
            <section className="detail__section">
              <h2>Day-by-Day Itinerary</h2>
              <div className="itinerary__timeline">
                {item.itinerary.map((day, i) => (
                  <DayItem key={i} day={day} index={i} />
                ))}
              </div>
            </section>
          )}

          {item.highlights && (
            <section className="detail__section">
              <h2>Highlights</h2>
              <div className="detail__highlights">
                {item.highlights.map((h, i) => (
                  <div key={i} className="detail__highlight">
                    <span className="detail__highlight-icon">✦</span>
                    {h}
                  </div>
                ))}
              </div>
            </section>
          )}

          {item.includes && (
            <section className="detail__section">
              <h2>What's Included</h2>
              <div className="detail__includes">
                {item.includes.map((inc, i) => (
                  <div key={i} className="detail__include-tag">
                    ✓ {inc}
                  </div>
                ))}
              </div>
            </section>
          )}

          {item.excludes && item.excludes.length > 0 && (
            <section className="detail__section">
              <h2>What's Not Included</h2>
              <div className="detail__includes">
                {item.excludes.map((exc, i) => (
                  <div key={i} className="detail__include-tag detail__include-tag--exclude">
                    ✕ {exc}
                  </div>
                ))}
              </div>
            </section>
          )}

          {item.paymentPlan && item.paymentPlan.length > 0 && (
            <section className="detail__section">
              <h2>How Payment Works</h2>
              <div className="detail__payment-plan">
                {item.paymentPlan.map((step, i) => (
                  <div key={i} className="detail__payment-step">
                    <span className="detail__payment-label">{step.label}</span>
                    <span className="detail__payment-amount">{formatMoney(step.amount, settings.currency)}</span>
                    <span className="detail__payment-when">{step.when}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {item.cancellationPolicy && (
            <section className="detail__section">
              <h2>Cancellation & Refund Rules</h2>
              <p>{item.cancellationPolicy}</p>
            </section>
          )}

          {(item.groupSize || item.meetingPoint || item.visaNote || item.insuranceNote) && (
            <section className="detail__section">
              <h2>Good to Know</h2>
              <div className="detail__booking-info">
                {item.groupSize && (
                  <div><strong>Group Size</strong><p>{item.groupSize}</p></div>
                )}
                {item.meetingPoint && (
                  <div><strong>Meeting Point</strong><p>{item.meetingPoint}</p></div>
                )}
                {item.visaNote && (
                  <div><strong>Visa / Passport</strong><p>{item.visaNote}</p></div>
                )}
                {item.insuranceNote && (
                  <div><strong>Travel Insurance</strong><p>{item.insuranceNote}</p></div>
                )}
              </div>
            </section>
          )}

          {/* Testimonials */}
          {item.testimonials && item.testimonials.length > 0 && (
            <section className="detail__section">
              <h2>What Travellers Say</h2>
              <div className="detail__testimonials">
                {item.testimonials.map((t, i) => (
                  <div key={i} className="detail__testimonial">
                    <div className="detail__testimonial-header">
                      <img src={t.avatar} alt={t.name} className="detail__testimonial-avatar" />
                      <div>
                        <strong>{t.name}</strong>
                        <span className="detail__testimonial-stars">
                          {"★".repeat(t.rating)}{"☆".repeat(5 - t.rating)}
                        </span>
                      </div>
                    </div>
                    <p>"{t.text}"</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </motion.div>

        {/* Sidebar Booking Card */}
        <motion.aside
          className="detail__sidebar"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="detail__booking-card">
            <h3>Book This Trip</h3>
            <div className="detail__booking-price">
              {formatMoney(item.price, settings.currency)}
              <span>/person</span>
            </div>

            {/* Seats Left */}
            {item.seatsLeft && (
              <div className={`detail__seats-badge ${seatsUrgent ? "detail__seats-badge--urgent" : ""}`}>
                {seatsUrgent ? "🔥" : "🪑"} Only <strong>{item.seatsLeft}</strong> seats left
              </div>
            )}

            {/* Countdown */}
            <CountdownTimer targetDate={item.startDate} className="detail__countdown" />

            <div className="detail__booking-info">
              <div>
                <strong>Dates</strong>
                <p>{item.dates}</p>
              </div>
              <div>
                <strong>Duration</strong>
                <p>{item.duration}</p>
              </div>
              {item.difficulty && item.difficulty.toLowerCase() !== "easy" && (
                <div>
                  <strong>Difficulty</strong>
                  <p className={`detail__booking-diff detail__booking-diff--${item.difficulty.toLowerCase()}`}>
                    {item.difficulty}
                  </p>
                </div>
              )}
              {item.bestSeason && (
                <div>
                  <strong>Best Season</strong>
                  <p>{item.bestSeason}</p>
                </div>
              )}
            </div>

            <a
              href={waLink(`Hi! I'm interested in the ${item.destination} trip (${item.dates}). Can you share more details?`)}
              target="_blank"
              rel="noreferrer"
              className="detail__booking-btn"
            >
              📲 Enquire on WhatsApp
            </a>
            <a href={`tel:${String(settings.whatsapp || "").replace(/\D/g, "")}`} className="detail__booking-call">
              📞 {settings.phone}
            </a>
          </div>
        </motion.aside>
      </div>
    </div>
  );
}
