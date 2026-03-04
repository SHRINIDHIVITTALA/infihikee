import { useRef, useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Autoplay, Navigation } from "swiper/modules";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useItineraries } from "../context/ItineraryContext";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/navigation";
import "./HeroSlider.css";

export default function HeroSlider() {
  const { getActiveItineraries } = useItineraries();
  const itineraries = getActiveItineraries();
  const [activeIndex, setActiveIndex] = useState(0);
  const [bgImage, setBgImage] = useState(itineraries[0]?.image || "");
  const navigate = useNavigate();

  useEffect(() => {
    if (itineraries[activeIndex]) {
      setBgImage(itineraries[activeIndex].image);
    }
  }, [activeIndex, itineraries]);

  const handleSlideChange = (swiper) => {
    setActiveIndex(swiper.realIndex);
  };

  if (itineraries.length === 0) {
    return (
      <section className="hero">
        <div className="hero__empty">
          <h2>No destinations available yet</h2>
          <p>Check back soon for amazing travel experiences!</p>
        </div>
      </section>
    );
  }

  return (
    <section className="hero">
      {/* Blurred background */}
      <div
        className="hero__bg"
        style={{ backgroundImage: `url(${bgImage})` }}
      />
      <div className="hero__overlay" />

      <div className="hero__content">
        <motion.div
          className="hero__header"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <span className="hero__eyebrow">Trusted by 500+ Travelers Worldwide</span>
          <h1 className="hero__title">
            Discover the World with{" "}
            <span className="hero__title-accent">Infinity Hikers</span>
          </h1>
          <p className="hero__subtitle">
            Premium group adventures with handpicked stays, all-inclusive meals, flights &amp; visa — crafted for unforgettable experiences.
          </p>
        </motion.div>

        <Swiper
          modules={[EffectCoverflow, Autoplay, Navigation]}
          effect="coverflow"
          grabCursor
          centeredSlides
          slidesPerView="auto"
          loop={itineraries.length > 2}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          coverflowEffect={{
            rotate: 8,
            stretch: 0,
            depth: 200,
            modifier: 1.5,
            slideShadows: true,
          }}
          navigation
          onSlideChange={handleSlideChange}
          className="hero__swiper"
        >
          {itineraries.map((item, i) => (
            <SwiperSlide key={item.id} className="hero__slide">
              <div
                className="hero__card"
                onClick={() => navigate(`/destination/${item.id}`)}
              >
                <div
                  className="hero__card-image"
                  style={{ backgroundImage: `url(${item.image})` }}
                />
                <div className="hero__card-overlay" />
                <div className="hero__card-content">
                  <div className="hero__card-tags">
                    <span className="hero__card-dates">{item.dates}</span>
                    {item.difficulty && (
                      <span className={`hero__card-difficulty hero__card-difficulty--${item.difficulty?.toLowerCase()}`}>
                        {item.difficulty}
                      </span>
                    )}
                  </div>
                  <h2 className="hero__card-destination">
                    {item.destination}
                  </h2>
                  <p className="hero__card-duration">{item.duration}</p>
                  {item.rating && (
                    <div className="hero__card-rating">
                      <span className="hero__card-rating-star">★</span>
                      {item.rating}
                      <span className="hero__card-rating-count">({item.reviewCount})</span>
                    </div>
                  )}
                  <div className="hero__card-price">
                    ₹{item.price?.toLocaleString("en-IN")}
                    <span>/person</span>
                  </div>
                  <button className="hero__card-btn">View Details</button>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>


      </div>
    </section>
  );
}
