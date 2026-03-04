import { useParams, useNavigate } from "react-router-dom";
import { useItineraries } from "../context/ItineraryContext";
import { motion } from "framer-motion";
import { useState } from "react";
import "./DestinationDetail.css";

export default function DestinationDetail() {
  const { id } = useParams();
  const { itineraries } = useItineraries();
  const navigate = useNavigate();
  const [selectedImg, setSelectedImg] = useState(0);

  const item = itineraries.find((i) => i.id === id);

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

  return (
    <div className="detail">
      {/* Hero */}
      <div
        className="detail__hero"
        style={{ backgroundImage: `url(${item.gallery?.[selectedImg] || item.image})` }}
      >
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
          <span className="detail__dates">{item.dates}</span>
          <h1 className="detail__title">{item.destination}</h1>
          <p className="detail__country">{item.country}</p>
          <div className="detail__meta">
            <span>{item.duration}</span>
            {item.difficulty && (
              <span className={`detail__difficulty detail__difficulty--${item.difficulty.toLowerCase()}`}>
                {item.difficulty}
              </span>
            )}
            {item.rating && (
              <span className="detail__rating">★ {item.rating} <small>({item.reviewCount} reviews)</small></span>
            )}
            <span className="detail__price">
              ₹{item.price?.toLocaleString("en-IN")}
              <small>/person</small>
            </span>
          </div>
        </motion.div>
      </div>

      {/* Gallery */}
      {item.gallery && item.gallery.length > 0 && (
        <div className="detail__gallery">
          {item.gallery.map((img, i) => (
            <div
              key={i}
              className={`detail__gallery-thumb ${
                selectedImg === i ? "detail__gallery-thumb--active" : ""
              }`}
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

        <motion.aside
          className="detail__sidebar"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="detail__booking-card">
            <h3>Book This Trip</h3>
            <div className="detail__booking-price">
              ₹{item.price?.toLocaleString("en-IN")}
              <span>/person</span>
            </div>
            <div className="detail__booking-info">
              <div>
                <strong>Dates</strong>
                <p>{item.dates}</p>
              </div>
              <div>
                <strong>Duration</strong>
                <p>{item.duration}</p>
              </div>
              {item.difficulty && (
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
              href={`https://wa.me/919916258596?text=Hi! I'm interested in the ${item.destination} trip (${item.dates}). Can you share more details?`}
              target="_blank"
              rel="noreferrer"
              className="detail__booking-btn"
            >
              Enquire on WhatsApp
            </a>
            <a href="tel:+919916258596" className="detail__booking-call">
              📞 +91 99162 58596
            </a>
          </div>
        </motion.aside>
      </div>
    </div>
  );
}
