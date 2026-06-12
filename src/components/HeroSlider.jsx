import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useItineraries } from "../context/ItineraryContext";
import { Search, MapPin, Calendar, Users, Tent, Backpack, Home, ChevronLeft, ChevronRight } from "lucide-react";
import FloatingParticles from "./FloatingParticles";
import "./HeroSlider.css";

const CATEGORIES = [
  { id: 'trek', icon: Backpack, label: 'TREK' },
  { id: 'tours', icon: MapPin, label: 'TOURS' },
  { id: 'rental', icon: Tent, label: 'RENTAL' },
  { id: 'camping', icon: Tent, label: 'CAMPING' },
  { id: 'stays', icon: Home, label: 'STAYS' }
];

const HERO_SLIDES = [
  {
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1600&q=80",
    title: "Your Tour, Perfectly",
    script: "Personalised!",
    subtitle: "Explore Bali, Bhutan, Vietnam & Beyond"
  },
  {
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1600&q=80",
    title: "Trek to the",
    script: "Himalayas!",
    subtitle: "Expert-guided adventures through the world's greatest peaks"
  },
  {
    image: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1600&q=80",
    title: "Discover",
    script: "Singapore!",
    subtitle: "City lights, garden wonders & world-class experiences"
  },
  {
    image: "https://images.unsplash.com/photo-1528127269322-539801943592?w=1600&q=80",
    title: "Cruise Through",
    script: "Vietnam!",
    subtitle: "Ha Long Bay, Hoi An & the best street food on earth"
  },
];

export default function HeroSlider() {
  const { getActiveItineraries } = useItineraries();
  const itineraries = getActiveItineraries();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('tours');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPaused, setIsPaused] = useState(false);

  const floatingDestinations = itineraries.slice(0, 4);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  const handleSearch = () => {
    const q = searchQuery.trim();
    navigate(q ? `/destinations?q=${encodeURIComponent(q)}` : "/destinations");
  };

  const slide = HERO_SLIDES[currentSlide];

  return (
    <section
      className="hero"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Carousel background */}
      <AnimatePresence mode="sync">
        <motion.div
          key={currentSlide}
          className="hero__slide-bg"
          style={{ backgroundImage: `url(${slide.image})` }}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        />
      </AnimatePresence>
      <div className="hero__slide-overlay" />

      {/* Particles */}
      <FloatingParticles />

      {/* Prev / Next arrows */}
      <button className="hero__arrow hero__arrow--prev" onClick={prevSlide} aria-label="Previous slide">
        <ChevronLeft size={24} />
      </button>
      <button className="hero__arrow hero__arrow--next" onClick={nextSlide} aria-label="Next slide">
        <ChevronRight size={24} />
      </button>

      <div className="container hero__inner">
        <div className="hero__content">
          <AnimatePresence mode="wait">
            <motion.h1
              key={`title-${currentSlide}`}
              className="hero__title"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.6 }}
            >
              {slide.title} <br />
              <span className="font-script text-gradient">{slide.script}</span>
            </motion.h1>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.p
              key={`sub-${currentSlide}`}
              className="hero__subtitle"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {slide.subtitle}
            </motion.p>
          </AnimatePresence>

          <motion.div
            className="hero__search-widget"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="search-tabs">
              {CATEGORIES.map(cat => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    className={`search-tab ${activeTab === cat.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(cat.id)}
                  >
                    <Icon size={18} /> {cat.label}
                  </button>
                );
              })}
            </div>
            <div className="search-inputs">
              <div className="search-input-group">
                <MapPin size={20} className="input-icon" />
                <input
                  type="text"
                  placeholder="Where to?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <div className="search-input-divider" />
              <div className="search-input-group">
                <Calendar size={20} className="input-icon" />
                <input type="text" placeholder="When?" />
              </div>
              <div className="search-input-divider" />
              <div className="search-input-group">
                <Users size={20} className="input-icon" />
                <input type="text" placeholder="Travelers" />
              </div>
              <button className="search-btn" onClick={handleSearch}>
                <Search size={18} />
                <span className="search-btn-text">Search trips</span>
              </button>
            </div>
            <div className="search-suggestions">
              <span className="search-suggestions__label">Popular:</span>
              {["Weekend Treks", "Himalayas", "Bali", "Under ₹60k"].map(chip => (
                <button
                  key={chip}
                  className="search-chip"
                  onClick={() => { setSearchQuery(chip); handleSearch(); }}
                >{chip}</button>
              ))}
            </div>
          </motion.div>

          {/* Slide dots */}
          <div className="hero__dots">
            {HERO_SLIDES.map((_, i) => (
              <button
                key={i}
                className={`hero__dot ${i === currentSlide ? "hero__dot--active" : ""}`}
                onClick={() => setCurrentSlide(i)}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Floating Cards */}
        {floatingDestinations.map((dest, i) => (
          <motion.div
            key={dest.id}
            className={`hero__floating-card hero__floating-card--${i}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 + (i * 0.1) }}
            onClick={() => navigate(`/destination/${dest.id}`)}
          >
            <div className="floating-card__img" style={{ backgroundImage: `url(${dest.image})` }} />
            <div className="floating-card__label">{dest.destination}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
