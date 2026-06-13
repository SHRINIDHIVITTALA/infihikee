import { createContext, useContext, useState, useEffect } from "react";

const DEFAULT_TESTIMONIALS = [
  { id: "t1", name: "Priya Sharma", avatar: "https://i.pravatar.cc/80?img=32", rating: 5, destination: "Singapore", text: "Every detail was planned perfectly. The Gardens by the Bay light show took my breath away. Already planning my next trip!" },
  { id: "t2", name: "Ankit Verma", avatar: "https://i.pravatar.cc/80?img=15", rating: 5, destination: "Bhutan", text: "The Tiger's Nest trek was life-changing. Infinity Hikers made the impossible feel effortless. Worth every rupee." },
  { id: "t3", name: "Karthik Nair", avatar: "https://i.pravatar.cc/80?img=53", rating: 5, destination: "Vietnam", text: "Ha Long Bay was out of this world! The cooking class in Hoi An was a delightful surprise I'll never forget." },
  { id: "t4", name: "Neha Gupta", avatar: "https://i.pravatar.cc/80?img=47", rating: 5, destination: "Bali", text: "Perfect honeymoon trip! The Balinese spa and Uluwatu sunset cliff were moments straight out of a dream." },
  { id: "t5", name: "Divya Patel", avatar: "https://i.pravatar.cc/80?img=23", rating: 5, destination: "Vietnam", text: "10 days of pure joy. Vietnam's street food alone is worth the trip. The team's planning was absolutely flawless." },
  { id: "t6", name: "Arun Krishnan", avatar: "https://i.pravatar.cc/80?img=59", rating: 5, destination: "Bali", text: "Bali exceeded every expectation. The sunrise trek to Mount Batur was the single best moment of my entire year." },
];

const TestimonialsContext = createContext();
const STORAGE_KEY = "infinityHikers_testimonials";

export function TestimonialsProvider({ children }) {
  const [testimonials, setTestimonials] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return DEFAULT_TESTIMONIALS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(testimonials));
  }, [testimonials]);

  const addTestimonial = (t) =>
    setTestimonials((prev) => [...prev, { ...t, id: Date.now().toString() }]);

  const updateTestimonial = (id, updates) =>
    setTestimonials((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );

  const deleteTestimonial = (id) =>
    setTestimonials((prev) => prev.filter((t) => t.id !== id));

  const resetTestimonials = () => setTestimonials(DEFAULT_TESTIMONIALS);

  return (
    <TestimonialsContext.Provider
      value={{ testimonials, addTestimonial, updateTestimonial, deleteTestimonial, resetTestimonials }}
    >
      {children}
    </TestimonialsContext.Provider>
  );
}

export function useTestimonials() {
  const ctx = useContext(TestimonialsContext);
  if (!ctx) throw new Error("useTestimonials must be used within TestimonialsProvider");
  return ctx;
}
