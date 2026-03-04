import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./Testimonials.css";

const allTestimonials = [
  {
    name: "Priya Sharma",
    avatar: "https://i.pravatar.cc/80?img=32",
    rating: 5,
    destination: "Singapore",
    text: "Singapore was magical! Every detail was planned perfectly. The Gardens by the Bay light show was breathtaking.",
  },
  {
    name: "Ankit Verma",
    avatar: "https://i.pravatar.cc/80?img=15",
    rating: 5,
    destination: "Bhutan",
    text: "The Tiger's Nest trek was life-changing. Infinity Hikers made the impossible feel effortless.",
  },
  {
    name: "Karthik Nair",
    avatar: "https://i.pravatar.cc/80?img=53",
    rating: 5,
    destination: "Vietnam",
    text: "Ha Long Bay was out of this world! The cooking class in Hoi An was a delightful surprise.",
  },
  {
    name: "Neha Gupta",
    avatar: "https://i.pravatar.cc/80?img=47",
    rating: 5,
    destination: "Bali",
    text: "Perfect honeymoon trip! The Balinese spa and Uluwatu sunset were unforgettable moments.",
  },
  {
    name: "Divya Patel",
    avatar: "https://i.pravatar.cc/80?img=23",
    rating: 5,
    destination: "Vietnam",
    text: "10 days of pure joy. Vietnam's street food alone is worth the trip. Incredible planning by the team!",
  },
  {
    name: "Arun Krishnan",
    avatar: "https://i.pravatar.cc/80?img=59",
    rating: 5,
    destination: "Bali",
    text: "Bali exceeded all expectations. The sunrise trek to Mount Batur was the highlight of my year!",
  },
];

function StarRating({ rating }) {
  return (
    <div className="testimonial__stars">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`testimonial__star ${star <= rating ? "testimonial__star--filled" : ""}`}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default function Testimonials() {
  const [active, setActive] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setActive((prev) => (prev + 1) % allTestimonials.length);
    }, 5000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const goTo = (index) => {
    setActive(index);
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setActive((prev) => (prev + 1) % allTestimonials.length);
    }, 5000);
  };

  const current = allTestimonials[active];

  return (
    <section className="testimonials">
      <motion.div
        className="testimonials__header"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <span className="testimonials__badge">Traveler Stories</span>
        <h2>
          What Our <span className="accent">Travelers</span> Say
        </h2>
        <p className="testimonials__subtitle">
          Real experiences from real adventurers who explored the world with us
        </p>
      </motion.div>

      <div className="testimonials__content">
        {/* Trust indicators */}
        <motion.div
          className="testimonials__trust"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="testimonials__trust-item">
            <span className="testimonials__trust-number">4.9</span>
            <StarRating rating={5} />
            <span className="testimonials__trust-label">Average Rating</span>
          </div>
          <div className="testimonials__trust-divider" />
          <div className="testimonials__trust-item">
            <span className="testimonials__trust-number">500+</span>
            <span className="testimonials__trust-label">Happy Travelers</span>
          </div>
          <div className="testimonials__trust-divider" />
          <div className="testimonials__trust-item">
            <span className="testimonials__trust-number">98%</span>
            <span className="testimonials__trust-label">Would Recommend</span>
          </div>
        </motion.div>

        {/* Testimonial Card */}
        <div className="testimonials__carousel">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              className="testimonials__card"
              initial={{ opacity: 0, x: 40, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -40, scale: 0.95 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <div className="testimonials__quote-icon">"</div>
              <p className="testimonials__text">{current.text}</p>
              <div className="testimonials__author">
                <img
                  src={current.avatar}
                  alt={current.name}
                  className="testimonials__avatar"
                />
                <div className="testimonials__author-info">
                  <span className="testimonials__name">{current.name}</span>
                  <span className="testimonials__destination">
                    Traveled to {current.destination}
                  </span>
                  <StarRating rating={current.rating} />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Dots */}
          <div className="testimonials__dots">
            {allTestimonials.map((_, i) => (
              <button
                key={i}
                className={`testimonials__dot ${i === active ? "testimonials__dot--active" : ""}`}
                onClick={() => goTo(i)}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Avatar strip */}
        <motion.div
          className="testimonials__avatars"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {allTestimonials.map((t, i) => (
            <button
              key={i}
              className={`testimonials__avatar-btn ${i === active ? "testimonials__avatar-btn--active" : ""}`}
              onClick={() => goTo(i)}
            >
              <img src={t.avatar} alt={t.name} />
            </button>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
