import { createContext, useContext, useState, useEffect, useRef } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";

export const DEFAULT_PAGES = {
  about: {
    heading: "About Infinity Pravasa",
    body:
      "Infinity Pravasa is a group travel company built for people who want to explore " +
      "the world without the stress of planning it themselves. We handle the flights, " +
      "hotels, transport and local guides — you just show up and enjoy the trip.\n\n" +
      "Every itinerary is put together by people who have actually been there, and every " +
      "group is looked after by a tour captain from start to finish.",
  },
  terms: {
    heading: "Terms & Conditions",
    body:
      "By booking a trip with Infinity Pravasa, you agree to the price, dates, inclusions " +
      "and cancellation rules shown on that trip's page at the time of booking.\n\n" +
      "Prices are per person and subject to change until a booking is confirmed with " +
      "payment. Travellers are responsible for having a valid passport, any required " +
      "visas, and personal travel insurance unless stated otherwise on the trip page.",
  },
  privacy: {
    heading: "Privacy Policy",
    body:
      "We collect the contact details you share with us (like your name, phone number " +
      "and email) only to respond to booking enquiries and share trip information.\n\n" +
      "We do not sell your information to third parties. Your details are used solely " +
      "by the Infinity Pravasa team to plan and communicate about your trip.",
  },
  treksIntro: {
    eyebrow: "Trails & Peaks",
    title: "TREKS",
    subtitle: "Lace up for Karnataka's best trekking trails and beyond",
  },
  pilgrimagesIntro: {
    eyebrow: "Sacred Journeys",
    title: "PILGRIMAGES",
    subtitle: "Temple trails and sacred sites, planned end to end",
  },
  faqs: [
    { question: "How do I book a trip?", answer: "Message us on WhatsApp with the trip you're interested in and we'll guide you through the next steps." },
    { question: "How do payments work?", answer: "Most trips need a booking amount to hold your seat, with the balance due before travel — check the Payment section on each trip page for exact amounts." },
    { question: "Can I cancel or get a refund?", answer: "Each trip page lists its own cancellation and refund rules under 'Cancellation & Refund Rules'." },
  ],
  sustainability: {
    badge: "🌍 Eco-Conscious Travel",
    heading: "Travel Responsibly",
    subheading: "We believe in leaving destinations better than we found them",
    offsetNote: "We contribute 2% of every booking to verified carbon offset projects. You can opt to offset the full amount during booking.",
    tips: [
      { icon: "🚰", title: "Carry Reusable Bottles", desc: "Skip single-use plastic. We provide filtered water refill stations at hotels." },
      { icon: "🧴", title: "Eco-Friendly Toiletries", desc: "Bring biodegradable sunscreen and shampoo bars to protect marine life." },
      { icon: "🛍️", title: "Say No to Plastic Bags", desc: "Carry a reusable tote for shopping and souvenirs." },
      { icon: "🚶", title: "Walk & Cycle", desc: "Explore neighborhoods on foot — it's the best way to discover hidden gems." },
      { icon: "🍽️", title: "Eat Local", desc: "Support local restaurants and street vendors instead of international chains." },
      { icon: "🏨", title: "Conserve Hotel Resources", desc: "Reuse towels, turn off AC when leaving, and take shorter showers." },
      { icon: "📸", title: "Leave No Trace", desc: "Take only photos, leave only footprints. Don't disturb wildlife or coral." },
      { icon: "💰", title: "Buy Fair Trade", desc: "Purchase souvenirs directly from artisans to ensure fair wages." },
    ],
    partners: [
      { icon: "🌿", name: "Sri Lanka Sustainable Tourism", focus: "Responsible travel and community tourism across Sri Lanka" },
      { icon: "🐢", name: "Bali Sea Turtle Society", focus: "Marine conservation & turtle rehabilitation" },
      { icon: "🐢", name: "Sri Lanka Marine Conservation", focus: "Coastal and sea turtle conservation" },
    ],
    commitments: [
      { icon: "🏨", title: "Eco-Certified Hotels", desc: "All partner hotels meet green certification standards" },
      { icon: "🚌", title: "Shared Transport", desc: "Group travel reduces per-person carbon footprint by 60%" },
      { icon: "🍃", title: "2% Green Fund", desc: "Every booking contributes to our environmental offset fund" },
      { icon: "📋", title: "No-Plastic Policy", desc: "Zero single-use plastics on all Infinity Pravasa trips" },
    ],
  },
};

const SitePagesContext = createContext();

export function SitePagesProvider({ children }) {
  const [pages, setPages] = useState(DEFAULT_PAGES);
  // Mirrors `pages` synchronously so a save reads the latest value instead of
  // a stale render-closure copy — fixes updatePage()/setFaqs() clobbering a
  // previous still-in-flight save.
  const pagesRef = useRef(DEFAULT_PAGES);
  const mutatedRef = useRef(false);
  const applyPages = (value) => {
    pagesRef.current = value;
    setPages(value);
  };

  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;
    supabase
      .from("site_config")
      .select("pages")
      .eq("id", 1)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled || mutatedRef.current) return;
        if (error) {
          console.warn("Could not load site pages from Supabase, showing built-in defaults:", error.message);
          return;
        }
        if (data?.pages) {
          applyPages({
            ...DEFAULT_PAGES,
            ...data.pages,
            faqs: Array.isArray(data.pages.faqs) ? data.pages.faqs : DEFAULT_PAGES.faqs,
          });
        }
      });
    return () => { cancelled = true; };
  }, []);

  const persist = async (next) => {
    mutatedRef.current = true;
    if (!isSupabaseConfigured()) {
      throw new Error("Saving isn't set up yet — add VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY in .env.");
    }
    const { error } = await supabase.from("site_config").update({ pages: next }).eq("id", 1);
    if (error) throw new Error(`Couldn't save: ${error.message}`);
    applyPages(next);
  };

  const updatePage = async (key, updates) => persist({ ...pagesRef.current, [key]: { ...pagesRef.current[key], ...updates } });

  const setFaqs = async (faqs) => persist({ ...pagesRef.current, faqs });

  // For a caller (like the Pages admin form) that changes several page keys
  // at once: merging and writing once avoids the last call clobbering the
  // ones before it, which a series of separate updatePage() awaits would do
  // — each reads pages from the same pre-save snapshot, not the one before it.
  const updatePages = async (updatesByKey) => persist({ ...pagesRef.current, ...updatesByKey });

  const resetPages = () => persist(DEFAULT_PAGES);

  return (
    <SitePagesContext.Provider value={{ pages, updatePage, updatePages, setFaqs, resetPages }}>
      {children}
    </SitePagesContext.Provider>
  );
}

export function useSitePages() {
  const ctx = useContext(SitePagesContext);
  if (!ctx) throw new Error("useSitePages must be used within SitePagesProvider");
  return ctx;
}
