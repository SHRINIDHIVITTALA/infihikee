import { createContext, useContext, useState, useEffect } from "react";
import defaultItineraries from "../data/itineraries";
import { deriveScope } from "../utils/catalog";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";

const ItineraryContext = createContext();

const REMOVED_IMAGE_ID = "photo-1586208958839-06c17cacdf08";
const FALLBACK_TOUR_IMAGE = "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80";

// snake_case DB row -> the camelCase shape every page already renders.
function rowToTour(row) {
  return {
    id: row.id,
    destination: row.destination,
    country: row.country,
    category: row.category || "tour",
    scope: row.scope || "international",
    dates: row.dates,
    startDate: row.start_date,
    endDate: row.end_date,
    duration: row.duration,
    durationDays: row.duration_days,
    price: row.price,
    currency: row.currency,
    difficulty: row.difficulty,
    rating: row.rating,
    reviewCount: row.review_count,
    activityType: row.activity_type,
    bestSeason: row.best_season,
    seatsLeft: row.seats_left,
    description: row.description,
    highlights: row.highlights || [],
    itinerary: row.itinerary || [],
    includes: row.includes || [],
    excludes: row.excludes || [],
    paymentPlan: row.payment_plan || [],
    depositNote: row.deposit_note,
    cancellationPolicy: row.cancellation_policy,
    groupSize: row.group_size,
    meetingPoint: row.meeting_point,
    visaNote: row.visa_note,
    insuranceNote: row.insurance_note,
    packingExtras: row.packing_extras || [],
    flightDistanceKm: row.flight_distance_km,
    co2PerPersonTonnes: row.co2_per_person_tonnes,
    coordinates: row.coordinates,
    image: row.image,
    gallery: (row.gallery || []).filter((img) => !String(img).includes(REMOVED_IMAGE_ID)),
    testimonials: row.testimonials || [],
    ecoBadges: row.eco_badges || [],
    ecoFriendly: row.eco_friendly,
    status: row.status,
  };
}

// The reverse — only used for insert/update, so it only needs to carry
// whatever fields the caller actually supplied.
function tourToRow(tour) {
  const row = {};
  const set = (col, val) => { if (val !== undefined) row[col] = val; };
  set("id", tour.id);
  set("destination", tour.destination);
  set("country", tour.country);
  set("category", tour.category);
  set("scope", tour.scope);
  set("dates", tour.dates);
  // A date column rejects "" — the admin form's blank date inputs must become null
  set("start_date", tour.startDate || null);
  set("end_date", tour.endDate || null);
  set("duration", tour.duration);
  set("duration_days", tour.durationDays);
  set("price", tour.price);
  set("currency", tour.currency);
  set("difficulty", tour.difficulty);
  set("rating", tour.rating);
  set("review_count", tour.reviewCount);
  set("activity_type", tour.activityType);
  set("best_season", tour.bestSeason);
  set("seats_left", tour.seatsLeft);
  set("description", tour.description);
  set("highlights", tour.highlights);
  set("itinerary", tour.itinerary);
  set("includes", tour.includes);
  set("excludes", tour.excludes);
  set("payment_plan", tour.paymentPlan);
  set("deposit_note", tour.depositNote);
  set("cancellation_policy", tour.cancellationPolicy);
  set("group_size", tour.groupSize);
  set("meeting_point", tour.meetingPoint);
  set("visa_note", tour.visaNote);
  set("insurance_note", tour.insuranceNote);
  set("packing_extras", tour.packingExtras);
  set("flight_distance_km", tour.flightDistanceKm ?? null);
  set("co2_per_person_tonnes", tour.co2PerPersonTonnes ?? null);
  set("coordinates", tour.coordinates);
  set("image", tour.image);
  set("gallery", tour.gallery);
  set("testimonials", tour.testimonials);
  set("eco_badges", tour.ecoBadges);
  set("eco_friendly", tour.ecoFriendly);
  set("status", tour.status);
  return row;
}

export function ItineraryProvider({ children }) {
  // Seeded with the bundled defaults so the site never shows nothing while
  // the network fetch is in flight, or if Supabase isn't configured at all.
  const [itineraries, setItineraries] = useState(defaultItineraries);

  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;
    supabase
      .from("tours")
      .select("*")
      .order("created_at", { ascending: true })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          // Most likely cause: the migration hasn't been run yet. Keep the
          // bundled defaults rather than showing an empty site.
          console.warn("Could not load tours from Supabase, showing built-in defaults:", error.message);
          return;
        }
        if (data && data.length) setItineraries(data.map(rowToTour));
      });
    return () => { cancelled = true; };
  }, []);

  const addItinerary = async (itinerary) => {
    const image = itinerary.image || FALLBACK_TOUR_IMAGE;
    const newItem = {
      ...itinerary,
      image,
      gallery: Array.isArray(itinerary.gallery) && itinerary.gallery.length ? itinerary.gallery : [image],
      itinerary: Array.isArray(itinerary.itinerary) ? itinerary.itinerary : [],
      highlights: Array.isArray(itinerary.highlights) ? itinerary.highlights : [],
      includes: Array.isArray(itinerary.includes) ? itinerary.includes : [],
      id: itinerary.id || `${itinerary.destination.toLowerCase()}-${Date.now()}`,
      status: itinerary.status || "active",
      category: itinerary.category || "tour",
      scope: itinerary.scope || deriveScope(itinerary.country, itinerary.destination),
    };
    if (!isSupabaseConfigured()) {
      throw new Error("Saving isn't set up yet — add VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY in .env.");
    }
    const { error } = await supabase.from("tours").insert(tourToRow(newItem));
    if (error) throw new Error(`Couldn't save "${newItem.destination}": ${error.message}`);
    setItineraries((prev) => [...prev, newItem]);
    return newItem;
  };

  const updateItinerary = async (id, updates) => {
    if (!isSupabaseConfigured()) {
      throw new Error("Saving isn't set up yet — add VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY in .env.");
    }
    const { error } = await supabase.from("tours").update(tourToRow(updates)).eq("id", id);
    if (error) throw new Error(`Couldn't save changes: ${error.message}`);
    setItineraries((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)));
  };

  const deleteItinerary = async (id) => {
    if (!isSupabaseConfigured()) {
      throw new Error("Deleting isn't set up yet — add VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY in .env.");
    }
    const { error } = await supabase.from("tours").delete().eq("id", id);
    if (error) throw new Error(`Couldn't delete: ${error.message}`);
    setItineraries((prev) => prev.filter((item) => item.id !== id));
  };

  const getActiveItineraries = () => {
    const seen = new Set();
    return itineraries
      .filter((i) => i.status === "active")
      .filter((i) => {
        if (seen.has(i.id)) return false;
        seen.add(i.id);
        return true;
      });
  };

  const resetToDefaults = () => {
    setItineraries(defaultItineraries);
  };

  return (
    <ItineraryContext.Provider
      value={{
        itineraries,
        addItinerary,
        updateItinerary,
        deleteItinerary,
        getActiveItineraries,
        resetToDefaults,
      }}
    >
      {children}
    </ItineraryContext.Provider>
  );
}

export function useItineraries() {
  const context = useContext(ItineraryContext);
  if (!context)
    throw new Error("useItineraries must be used within ItineraryProvider");
  return context;
}
