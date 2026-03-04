import { useRef, useState } from "react";

/**
 * Wraps children with a 3D tilt + glow on mouse move.
 */
export default function TiltCard({ children, className = "", onClick, intensity = 12 }) {
  const ref = useRef(null);
  const [style, setStyle] = useState({});

  const handleMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const midX = rect.width / 2;
    const midY = rect.height / 2;
    const rotateY = ((x - midX) / midX) * intensity;
    const rotateX = ((midY - y) / midY) * intensity;

    setStyle({
      transform: `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`,
      "--glow-x": `${(x / rect.width) * 100}%`,
      "--glow-y": `${(y / rect.height) * 100}%`,
    });
  };

  const handleLeave = () => {
    setStyle({
      transform: "perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)",
      "--glow-x": "50%",
      "--glow-y": "50%",
    });
  };

  return (
    <div
      ref={ref}
      className={`tilt-card ${className}`}
      style={style}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onClick={onClick}
    >
      <div className="tilt-card__glow" />
      {children}
    </div>
  );
}
