import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./Preloader.css";

export default function Preloader({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState("loading");
  const canvasRef = useRef(null);

  // Particle animation on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 0.8,
        speedY: (Math.random() - 0.5) * 0.8,
        opacity: Math.random() * 0.5 + 0.2,
      });
    }

    let animId;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 183, 77, ${p.opacity})`;
        ctx.fill();
      });

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(255, 183, 77, ${0.1 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Progress simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        const increment = Math.random() * 15 + 5;
        return Math.min(prev + increment, 100);
      });
    }, 300);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (progress >= 100 && phase === "loading") {
      const t1 = setTimeout(() => {
        setPhase("done");
        const t2 = setTimeout(() => onComplete(), 1000);
        return () => clearTimeout(t2);
      }, 600);
      return () => clearTimeout(t1);
    }
  }, [progress, phase]);

  return (
    <AnimatePresence>
      {phase !== "done" ? (
        <motion.div
          className="preloader"
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 1, ease: "easeInOut" }}
        >
          <canvas ref={canvasRef} className="preloader__particles" />

          <div className="preloader__content">
            {/* Logo */}
            <motion.div
              className="preloader__logo"
              initial={{ scale: 0, rotateY: -180 }}
              animate={{ scale: 1, rotateY: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            >
              <div className="preloader__logo-ring">
                <svg viewBox="0 0 120 120" className="preloader__ring-svg">
                  <circle
                    cx="60" cy="60" r="54"
                    fill="none"
                    stroke="url(#ringGrad)"
                    strokeWidth="2"
                    strokeDasharray="340"
                    strokeDashoffset="60"
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FFB74D" />
                      <stop offset="100%" stopColor="#FF8A65" stopOpacity="0.2" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="preloader__logo-icon">
                  <img src="/logo.png" alt="Infinity Hikers" className="preloader__logo-image" />
                </div>
              </div>
              <h1 className="preloader__title">
                <span className="preloader__title-infinity">Infinity</span>
                <span className="preloader__title-hikers">Hikers</span>
              </h1>
              <p className="preloader__tagline">
                Backpacker &bull; Trekking &bull; Nature Trail
              </p>
            </motion.div>

            {/* Loading bar */}
            {phase === "loading" && (
              <motion.div
                className="preloader__progress"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="preloader__progress-track">
                  <motion.div
                    className="preloader__progress-fill"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="preloader__progress-text">
                  {Math.round(progress)}%
                </span>
              </motion.div>
            )}


          </div>

          {/* Background gradient orbs */}
          <div className="preloader__orb preloader__orb--1" />
          <div className="preloader__orb preloader__orb--2" />
          <div className="preloader__orb preloader__orb--3" />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
