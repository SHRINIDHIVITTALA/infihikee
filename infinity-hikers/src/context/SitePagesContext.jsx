import { createContext, useContext, useState, useEffect } from "react";

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
const STORAGE_KEY = "infinityHikers_sitePages";

export function SitePagesProvider({ children }) {
  const [pages, setPages] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          return {
            ...DEFAULT_PAGES,
            ...parsed,
            faqs: Array.isArray(parsed.faqs) ? parsed.faqs : DEFAULT_PAGES.faqs,
          };
        }
      }
    } catch {}
    return DEFAULT_PAGES;
  });

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(pages)); } catch { /* storage is unavailable */ }
  }, [pages]);

  const updatePage = (key, updates) =>
    setPages((prev) => ({ ...prev, [key]: { ...prev[key], ...updates } }));

  const setFaqs = (faqs) => setPages((prev) => ({ ...prev, faqs }));

  const resetPages = () => setPages(DEFAULT_PAGES);

  return (
    <SitePagesContext.Provider value={{ pages, updatePage, setFaqs, resetPages }}>
      {children}
    </SitePagesContext.Provider>
  );
}

export function useSitePages() {
  const ctx = useContext(SitePagesContext);
  if (!ctx) throw new Error("useSitePages must be used within SitePagesProvider");
  return ctx;
}
