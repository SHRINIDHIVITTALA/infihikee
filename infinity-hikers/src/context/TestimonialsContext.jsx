import { createContext, useContext, useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";

const DEFAULT_TESTIMONIALS = [
  { id: "t1", name: "Priya Sharma", avatar: "https://i.pravatar.cc/80?img=32", rating: 5, destination: "Sri Lanka", text: "Every detail was planned perfectly. Bentota Beach and the coastal train journey were unforgettable. Already planning my next trip!" },
  { id: "t2", name: "Ankit Verma", avatar: "https://i.pravatar.cc/80?img=15", rating: 5, destination: "Sri Lanka", text: "Sri Lanka was a perfect mix of beaches, wildlife, tea country and culture. Infinity Pravasa made every day effortless. Worth every rupee." },
  { id: "t4", name: "Neha Gupta", avatar: "https://i.pravatar.cc/80?img=47", rating: 5, destination: "Bali", text: "Perfect honeymoon trip! The Balinese spa and Uluwatu sunset cliff were moments straight out of a dream." },
  { id: "t6", name: "Arun Krishnan", avatar: "https://i.pravatar.cc/80?img=59", rating: 5, destination: "Bali", text: "Bali exceeded every expectation. The sunrise trek to Mount Batur was the single best moment of my entire year." },
];

const TestimonialsContext = createContext();

function rowToTestimonial(row) {
  return { id: row.id, name: row.name, avatar: row.avatar, rating: row.rating, destination: row.destination, text: row.text };
}

export function TestimonialsProvider({ children }) {
  // Seeded with the bundled defaults so testimonials are never empty while
  // the network fetch is in flight, or if Supabase isn't configured.
  const [testimonials, setTestimonials] = useState(DEFAULT_TESTIMONIALS);

  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;
    supabase
      .from("testimonials")
      .select("*")
      .order("created_at", { ascending: true })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          console.warn("Could not load testimonials from Supabase, showing built-in defaults:", error.message);
          return;
        }
        if (data && data.length) setTestimonials(data.map(rowToTestimonial));
      });
    return () => { cancelled = true; };
  }, []);

  const requireConfigured = () => {
    if (!isSupabaseConfigured()) {
      throw new Error("Saving isn't set up yet — add VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY in .env.");
    }
  };

  const addTestimonial = async (t) => {
    requireConfigured();
    const newTestimonial = { ...t, id: Date.now().toString() };
    const { error } = await supabase.from("testimonials").insert(newTestimonial);
    if (error) throw new Error(`Couldn't save the testimonial: ${error.message}`);
    setTestimonials((prev) => [...prev, newTestimonial]);
    return newTestimonial;
  };

  const updateTestimonial = async (id, updates) => {
    requireConfigured();
    const { error } = await supabase.from("testimonials").update(updates).eq("id", id);
    if (error) throw new Error(`Couldn't save changes: ${error.message}`);
    setTestimonials((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  const deleteTestimonial = async (id) => {
    requireConfigured();
    const { error } = await supabase.from("testimonials").delete().eq("id", id);
    if (error) throw new Error(`Couldn't delete: ${error.message}`);
    setTestimonials((prev) => prev.filter((t) => t.id !== id));
  };

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
