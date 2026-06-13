import { motion } from "framer-motion";
import { useTestimonials } from "../context/TestimonialsContext";
import "./Testimonials.css";

export default function Testimonials() {
  const { testimonials } = useTestimonials();
  return (
    <section className="testi">
      <div className="testi__grain" />

      <div className="container">
        <motion.div
          className="testi__header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65 }}
        >
          <span className="testi__eyebrow">Real stories</span>
          <h2 className="testi__title">WHAT THEY SAY</h2>
          <p className="testi__sub">
            482+ adventurers. Zero regrets.
          </p>
        </motion.div>

        <div className="testi__grid">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              className="testi__card"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
            >
              {/* Stars */}
              <div className="testi__stars">
                {"★".repeat(t.rating)}
                <span className="testi__dest-pill">{t.destination}</span>
              </div>

              {/* Quote */}
              <p className="testi__text">"{t.text}"</p>

              {/* Author */}
              <div className="testi__author">
                <img src={t.avatar} alt={t.name} className="testi__avatar" />
                <div>
                  <strong className="testi__name">{t.name}</strong>
                  <span className="testi__trip">Traveled to {t.destination}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
