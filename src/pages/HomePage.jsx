import { useRef } from "react";
import HeroSlider from "../components/HeroSlider";
import Testimonials from "../components/Testimonials";
import { useItineraries } from "../context/ItineraryContext";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import AnimatedCounter from "../components/AnimatedCounter";
import TextReveal from "../components/TextReveal";
import TiltCard from "../components/TiltCard";
import "./HomePage.css";

export default function HomePage() {
  const { getActiveItineraries } = useItineraries();
  const itineraries = getActiveItineraries();
  const navigate = useNavigate();
  const sectionRef = useRef(null);

  return (
    <div className="home">
      <HeroSlider />

      {/* About Section */}
      <section className="home__about">
        <div className="home__about-inner">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="home__about-text"
          >
            <span className="home__about-label">About Us</span>
            <h2>
              Why Choose <span className="accent">Infinity Hikers</span>?
            </h2>
            <p>
              We believe travel should be effortless, immersive, and deeply
              personal. Every itinerary is meticulously crafted, every
              accommodation handpicked, and every moment curated for
              unforgettable experiences.
            </p>
            <p>
              From the ancient monasteries of Bhutan to the vibrant streets of
              Singapore — we handle everything so you can focus purely on
              the journey.
            </p>
            <div className="home__stats">
              <div className="home__stat">
                <span className="home__stat-number">
                  <AnimatedCounter target={500} suffix="+" />
                </span>
                <span className="home__stat-label">Happy Travellers</span>
              </div>
              <div className="home__stat">
                <span className="home__stat-number">
                  <AnimatedCounter target={15} suffix="+" />
                </span>
                <span className="home__stat-label">Destinations</span>
              </div>
              <div className="home__stat">
                <span className="home__stat-number">
                  <AnimatedCounter target={4.9} />
                </span>
                <span className="home__stat-label">Avg Rating</span>
              </div>
            </div>
          </motion.div>
          <motion.div
            className="home__about-visual"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="home__about-grid">
              {itineraries.slice(0, 4).map((item, i) => (
                <div
                  key={item.id}
                  className={`home__about-img home__about-img--${i}`}
                  style={{ backgroundImage: `url(${item.image})` }}
                  onClick={() => navigate(`/destination/${item.id}`)}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Destinations Grid */}
      <section className="home__destinations" ref={sectionRef}>
        <motion.h2
          className="section-title"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <TextReveal>Upcoming Adventures</TextReveal>
        </motion.h2>
        <p className="section-subtitle">Explore our handpicked destinations and find your next journey</p>
        <div className="home__grid">
          {itineraries.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <TiltCard
                className="home__grid-card"
                onClick={() => navigate(`/destination/${item.id}`)}
              >
                <div
                  className="home__grid-card-img"
                  style={{ backgroundImage: `url(${item.image})` }}
                >
                  {item.activityType && (
                    <span className="home__grid-card-activity">{item.activityType}</span>
                  )}
                </div>
                <div className="home__grid-card-body">
                  <span className="home__grid-card-date">{item.dates}</span>
                  <h3>{item.destination}</h3>
                  <p>{item.duration}</p>
                  <div className="home__grid-card-tags">
                    {item.difficulty && (
                      <span className={`home__grid-card-diff home__grid-card-diff--${item.difficulty.toLowerCase()}`}>
                        {item.difficulty}
                      </span>
                    )}
                    {item.rating && (
                      <span className="home__grid-card-rating">
                        ★ {item.rating}
                      </span>
                    )}
                  </div>
                  <div className="home__grid-card-footer">
                    <span className="home__grid-card-price">
                      ₹{item.price?.toLocaleString("en-IN")}
                    </span>
                    <span className="home__grid-card-cta">Explore →</span>
                  </div>
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <Testimonials />

      {/* CTA Section */}
      <section className="home__cta">
        <motion.div
          className="home__cta-inner"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="home__cta-badge">Get Started</span>
          <h2>Ready for Your Next Adventure?</h2>
          <p>
            Let us plan your dream vacation with premium experiences,
            expert guides, and all-inclusive packages.
          </p>
          <div className="home__cta-actions">
            <a href="tel:+919916258596" className="home__cta-phone">
              <span className="home__cta-btn-shimmer" />
              📞 +91 99162 58596
            </a>
            <button
              className="home__cta-btn"
              onClick={() => navigate("/destinations")}
            >
              View All Destinations
            </button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
