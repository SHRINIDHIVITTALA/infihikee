import { motion } from "framer-motion";

/**
 * Splits text into individual characters and staggered-animates them.
 * mode: "words" | "chars"
 */
export default function TextReveal({ children, className = "", delay = 0, mode = "words" }) {
  const text = typeof children === "string" ? children : "";

  const container = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: mode === "chars" ? 0.025 : 0.08,
        delayChildren: delay,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 30, rotateX: -40 },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: { type: "spring", damping: 12, stiffness: 100 },
    },
  };

  const tokens = mode === "chars" ? text.split("") : text.split(" ");

  return (
    <motion.span
      className={`text-reveal ${className}`}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      style={{ display: "inline-flex", flexWrap: "wrap", perspective: "600px" }}
    >
      {tokens.map((token, i) => (
        <motion.span
          key={i}
          variants={item}
          style={{
            display: "inline-block",
            whiteSpace: mode === "chars" ? "pre" : undefined,
            marginRight: mode === "words" ? "0.3em" : undefined,
          }}
        >
          {token}
        </motion.span>
      ))}
    </motion.span>
  );
}
