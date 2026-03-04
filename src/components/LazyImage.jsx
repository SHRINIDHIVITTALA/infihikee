import { useState, useRef, useEffect } from "react";

export default function LazyImage({ src, alt, className, style, ...props }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );

    if (imgRef.current) observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={imgRef}
      className={`lazy-image-wrap ${isLoaded ? "lazy-image-wrap--loaded" : ""} ${className || ""}`}
      style={style}
      {...props}
    >
      {isInView && (
        <img
          src={src}
          alt={alt || ""}
          className="lazy-image"
          onLoad={() => setIsLoaded(true)}
          loading="lazy"
        />
      )}
    </div>
  );
}
