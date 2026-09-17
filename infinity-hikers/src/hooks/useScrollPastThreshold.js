import { useState, useEffect } from "react";

/** True once the page has scrolled past `threshold` pixels. */
export function useScrollPastThreshold(threshold) {
  const [past, setPast] = useState(false);

  useEffect(() => {
    const onScroll = () => setPast(window.scrollY > threshold);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return past;
}
