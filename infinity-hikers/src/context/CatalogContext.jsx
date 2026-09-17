import { createContext, useContext, useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabaseClient";

// Top-level trip type. Distinct from `activityType` (pilgrimage/beach/trekking/
// premium), which describes the experience style within a trip.
export const DEFAULT_CATEGORY_OPTIONS = [
  { value: "tour", label: "Tour" },
  { value: "trek", label: "Trek" },
  { value: "pilgrimage", label: "Pilgrimage" },
  { value: "activity", label: "Activity" },
];

// Geographic tier shown as a browse filter.
export const DEFAULT_SCOPE_OPTIONS = [
  { value: "international", label: "International" },
  { value: "national", label: "National" },
  { value: "karnataka", label: "Karnataka" },
];

const CatalogContext = createContext();

function slugify(label, existing) {
  const base = String(label || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "option";
  let slug = base;
  let n = 2;
  while (existing.some((o) => o.value === slug)) slug = `${base}-${n++}`;
  return slug;
}

export function CatalogProvider({ children }) {
  const [categoryOptions, setCategoryOptions] = useState(DEFAULT_CATEGORY_OPTIONS);
  const [scopeOptions, setScopeOptions] = useState(DEFAULT_SCOPE_OPTIONS);
  // These fields get edited keystroke-by-keystroke (rename inputs), so writes
  // are debounced rather than sent on every change — see the effect below.
  const [saveError, setSaveError] = useState("");
  const debounceRef = useRef(null);
  // True only when a mutator below actually ran — NOT set by the initial
  // Supabase fetch's setState. Every page (not just the admin panel) mounts
  // this provider, so without this guard the persist effect below would fire
  // an update attempt on every single page load for every visitor, the
  // moment the fetched data lands in state.
  const dirtyRef = useRef(false);

  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;
    supabase
      .from("site_config")
      .select("category_options, scope_options")
      .eq("id", 1)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          console.warn("Could not load trip types/regions from Supabase, showing built-in defaults:", error.message);
        } else if (data) {
          if (data.category_options?.length) setCategoryOptions(data.category_options);
          if (data.scope_options?.length) setScopeOptions(data.scope_options);
        }
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!dirtyRef.current || !supabase) return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const { error } = await supabase
        .from("site_config")
        .update({ category_options: categoryOptions, scope_options: scopeOptions })
        .eq("id", 1);
      setSaveError(error ? `Couldn't save trip types/regions: ${error.message}` : "");
    }, 600);
    return () => clearTimeout(debounceRef.current);
  }, [categoryOptions, scopeOptions]);

  // Every mutator marks the state dirty before touching it, so the persist
  // effect above can tell "an admin changed this" apart from "the initial
  // fetch just landed" — see dirtyRef's comment.
  const addCategory = (label) => { dirtyRef.current = true; setCategoryOptions((prev) => [...prev, { value: slugify(label, prev), label }]); };
  const renameCategory = (value, label) => { dirtyRef.current = true; setCategoryOptions((prev) => prev.map((o) => (o.value === value ? { ...o, label } : o))); };
  const removeCategory = (value) => { dirtyRef.current = true; setCategoryOptions((prev) => (prev.length > 1 ? prev.filter((o) => o.value !== value) : prev)); };

  const addScope = (label) => { dirtyRef.current = true; setScopeOptions((prev) => [...prev, { value: slugify(label, prev), label }]); };
  const renameScope = (value, label) => { dirtyRef.current = true; setScopeOptions((prev) => prev.map((o) => (o.value === value ? { ...o, label } : o))); };
  const removeScope = (value) => { dirtyRef.current = true; setScopeOptions((prev) => (prev.length > 1 ? prev.filter((o) => o.value !== value) : prev)); };

  const resetCatalog = () => { dirtyRef.current = true; setCategoryOptions(DEFAULT_CATEGORY_OPTIONS); setScopeOptions(DEFAULT_SCOPE_OPTIONS); };

  return (
    <CatalogContext.Provider value={{
      categoryOptions, addCategory, renameCategory, removeCategory,
      scopeOptions, addScope, renameScope, removeScope,
      resetCatalog, catalogSaveError: saveError,
    }}>
      {children}
    </CatalogContext.Provider>
  );
}

export function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error("useCatalog must be used within CatalogProvider");
  return ctx;
}
