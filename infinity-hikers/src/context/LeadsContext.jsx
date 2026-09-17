import { createContext, useContext, useState, useEffect, useRef } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";

// Kept for continuity with any leads collected before this fix (the "Get a
// Callback" form used to write only to the visitor's own browser — see
// MOCK_DATA_AUDIT.md), and as a same-browser fallback if Supabase isn't
// configured at all.
const LOCAL_KEY = "infinityHikers_leads";

function readLocalLeads() {
  try {
    const parsed = JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

const LeadsContext = createContext();

function rowToLead(row) {
  return { id: row.id, name: row.name, phone: row.phone, trip: row.trip, message: row.message, createdAt: row.created_at };
}

export function LeadsProvider({ children }) {
  // Seeded from localStorage so any leads already collected under the old
  // browser-only behavior aren't lost the moment this ships.
  const [leads, setLeads] = useState(() => readLocalLeads());
  // Set the moment any mutator starts, so the initial fetch never clobbers
  // a lead submitted while that fetch was still in flight.
  const mutatedRef = useRef(false);

  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;
    supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (cancelled || mutatedRef.current) return;
        if (error) {
          console.warn("Could not load leads from Supabase (has migration 0005_leads.sql been run?), showing only locally-saved leads:", error.message);
          return;
        }
        setLeads(data.map(rowToLead));
      });
    return () => { cancelled = true; };
  }, []);

  // Called from the public "Get a Callback" form — must never throw to an
  // anonymous visitor. If Supabase isn't reachable, the request is saved to
  // this browser instead of being silently lost outright.
  const addLead = async (lead) => {
    mutatedRef.current = true;
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from("leads").insert(lead).select().single();
      if (!error) {
        setLeads((prev) => [rowToLead(data), ...prev]);
        return;
      }
      console.warn("Couldn't save the lead to Supabase, saving locally instead:", error.message);
    }
    const local = { ...lead, id: `local-${Date.now()}`, createdAt: new Date().toISOString() };
    try {
      const next = [local, ...readLocalLeads()].slice(0, 200);
      localStorage.setItem(LOCAL_KEY, JSON.stringify(next));
    } catch { /* storage unavailable */ }
    setLeads((prev) => [local, ...prev]);
  };

  const deleteAllLeads = async () => {
    mutatedRef.current = true;
    if (isSupabaseConfigured()) {
      const { error } = await supabase.from("leads").delete().gt("created_at", "1970-01-01");
      if (error) throw new Error(`Couldn't clear leads: ${error.message}`);
    }
    try { localStorage.removeItem(LOCAL_KEY); } catch { /* storage unavailable */ }
    setLeads([]);
  };

  return (
    <LeadsContext.Provider value={{ leads, addLead, deleteAllLeads }}>
      {children}
    </LeadsContext.Provider>
  );
}

export function useLeads() {
  const ctx = useContext(LeadsContext);
  if (!ctx) throw new Error("useLeads must be used within LeadsProvider");
  return ctx;
}
