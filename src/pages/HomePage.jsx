import { useRef } from "react";
import HeroSlider from "../components/HeroSlider";
import { useItineraries } from "../context/ItineraryContext";
import { useWishlist } from "../context/WishlistContext";
import { useCompare } from "../context/CompareContext";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import AnimatedCounter from "../components/AnimatedCounter";
import Testimonials from "../components/Testimonials";
import CountdownTimer from "../components/CountdownTimer";
import { usePageMeta } from "../hooks/usePageMeta";
import { Star, Clock, MapPin, ArrowRight, Heart, GitCompare } from "lucide-react";
import "./HomePage.css";

const EXPERIENCES = [
  {
    id: 'weekend',
    label: 'Weekend Treks',
    count: '12 itineraries',
    image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=600&auto=format&fit=crop&q=70',
  },
  {
    id: 'himalayan',
    label: 'Himalayan Treks',
    count: '8 itineraries',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&auto=format&fit=crop&q=70',
  },
  {
    id: 'backpacking',
    label: 'Backpacking',
    count: '15 itineraries',
    image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&auto=format&fit=crop&q=70',
  },
  {
    id: 'corporate',
    label: 'Corporate Outings',
    count: '6 packages',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop&q=70',
  },
];

// Pick a contextual badge for a trip card (only if it adds new info)
function getBadge(item) {
  if (item.activityType === 'premium') return { label: 'Premium', cls: 'badge--bestseller' };
  if (item.reviewCount > 150 && item.difficulty !== 'Easy') return { label: 'Best Seller', cls: 'badge--bestseller' };
  if (item.reviewCount > 150) return { label: 'Popular', cls: 'badge--bestseller' };
  return null;
}

export default function HomePage() {
  const { getActiveItineraries } = useItineraries();
  const itineraries = getActiveItineraries();
  const navigate = useNavigate();
  const { toggle: toggleWish, isWished } = useWishlist();
  const { toggle: toggleCompare, isComparing } = useCompare();
  usePageMeta({});

  return (
    <div className="home">
      <HeroSlider />

      {/* ── Popular Experiences ──────────────────── */}
      <section className="home__experiences container section-padding">
        <div className="text-center">
          <span className="section-eyebrow">Explore by type</span>
          <h2 className="section-title">Popular Experiences</h2>
        </div>

        <div className="home__experiences-grid">
          {EXPERIENCES.map((exp, i) => (
            <motion.div
              key={exp.id}
              className="experience-card"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              onClick={() => navigate(`/destinations?type=${exp.id}`)}
            >
              <div className="experience-card__bg" style={{ backgroundImage: `url(${exp.image})` }} />
              <div className="experience-card__overlay" />
              <div className="experience-card__body">
                <h3 className="experience-card__title font-script">{exp.label}</h3>
                <div className="experience-card__meta">
                  <span className="experience-card__count">{exp.count}</span>
                  <span className="experience-card__arrow">→</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Trending Treks & Tours ───────────────── */}
      <section className="home__destinations container section-padding">
        <div className="text-center">
          <span className="section-eyebrow">Curated picks</span>
          <h2 className="section-title">Trending Treks &amp; Tours</h2>
          <p className="section-subtitle" style={{ textTransform: 'none', color: 'var(--text-muted)', fontWeight: 400, fontSize: '1rem', marginTop: '0.5rem' }}>
            Expertly crafted adventures, handpicked for every kind of traveler
          </p>
        </div>

        <div className="tour-grid">
          {itineraries.map((item, i) => {
            const extraBadge = getBadge(item);
            return (
              <motion.div
                key={item.id}
                className="tour-card"
                onClick={() => navigate(`/destination/${item.id}`)}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="tour-card__image-container">
                  <div className="tour-card__image" style={{ backgroundImage: `url(${item.image})` }} />
                  <div className="tour-card__bg-text">{item.destination.split(' ')[0].toUpperCase()}</div>

                  {/* Wishlist + Compare buttons */}
                  <div className="tour-card__overlay-actions">
                    <button
                      className={`tour-card__action-btn ${isWished(item.id) ? "tour-card__action-btn--active" : ""}`}
                      onClick={e => { e.stopPropagation(); toggleWish(item.id); }}
                      aria-label="Save to wishlist"
                      title={isWished(item.id) ? "Remove from wishlist" : "Save to wishlist"}
                    >
                      <Heart size={15} fill={isWished(item.id) ? "#f97316" : "none"} stroke={isWished(item.id) ? "#f97316" : "#fff"} />
                    </button>
                    <button
                      className={`tour-card__action-btn ${isComparing(item.id) ? "tour-card__action-btn--compare" : ""}`}
                      onClick={e => { e.stopPropagation(); toggleCompare(item.id); }}
                      aria-label="Compare trip"
                      title="Add to compare"
                    >
                      <GitCompare size={15} stroke={isComparing(item.id) ? "#60a5fa" : "#fff"} />
                    </button>
                  </div>

                  <div className="tour-card__badges">
                    {item.difficulty && (
                      <span className="badge badge--difficulty">{item.difficulty}</span>
                    )}
                    {extraBadge && (
                      <span className={`badge ${extraBadge.cls}`}>{extraBadge.label}</span>
                    )}
                  </div>

                  {item.rating && (
                    <div className="tour-card__rating">
                      <Star size={12} fill="#fbbf24" stroke="none" />
                      {item.rating}
                    </div>
                  )}
                </div>

                <div className="tour-card__content">
                  <div className="tour-card__header">
                    <h3 className="tour-card__title">{item.destination}</h3>
                    <div className="tour-card__meta">
                      <span className="tour-card__meta-chip">
                        <Clock size={11} /> {item.duration}
                      </span>
                      {item.bestSeason && (
                        <span className="tour-card__meta-chip">
                          <MapPin size={11} /> {item.bestSeason}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Urgency: seats left + countdown */}
                  <div className="tour-card__urgency">
                    {item.seatsLeft && (
                      <span className={`tour-card__seats ${item.seatsLeft <= 4 ? "tour-card__seats--hot" : ""}`}>
                        {item.seatsLeft <= 4 ? "🔥" : "🪑"} {item.seatsLeft} seats left
                      </span>
                    )}
                    <CountdownTimer targetDate={item.startDate} className="cdtimer--card" />
                  </div>

                  <div className="tour-card__footer">
                    <div className="tour-card__price">
                      <span className="price-label">Starts from</span>
                      <span className="price-amount">₹{item.price?.toLocaleString("en-IN")}</span>
                    </div>
                    <button className="tour-card__btn">View itinerary</button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── Brand Story ──────────────────────────── */}
      <section className="home__about section-padding">
        <div className="container home__about-inner">
          <div className="home__about-text">
            <span className="section-eyebrow">Our story</span>
            <h2 className="section-title">
              We Create<br />
              <span className="text-gradient">Unforgettable Adventures</span>
            </h2>
            <p>
              Infinity Hikers brings you closer to nature with expertly curated treks, seamless tours,
              and memorable corporate outings. Whether you're a beginner seeking a weekend escape or
              an expert aiming for the Himalayan summits, our handpicked itineraries ensure safety,
              excitement, and the joy of discovery.
            </p>
            <button className="btn-primary-full" onClick={() => navigate("/destinations")}>
              View All Packages <ArrowRight size={16} style={{ marginLeft: '0.4rem' }} />
            </button>
          </div>

          <div className="home__about-stats">
            {[
              { target: 500, suffix: '+', label: 'Happy Trekkers' },
              { target: 50,  suffix: '+', label: 'Destinations' },
              { target: 4.9, suffix: '/5', label: 'Average Rating' },
              { target: 98,  suffix: '%', label: 'Would Recommend' },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                className="stat-box"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="stat-number text-gradient">
                  <AnimatedCounter target={s.target} suffix={s.suffix} />
                </div>
                <div className="stat-label">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Testimonials />
    </div>
  );
}
