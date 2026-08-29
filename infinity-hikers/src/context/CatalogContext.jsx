import { createContext, useContext, useState, useEffect } from "react";

// Top-level trip type. Distinct from `activityType` (cultural/beach/trekking/
// premium), which describes the experience style within a trip.
export const DEFAULT_CATEGORY_OPTIONS = [
  { value: "tour", label: "Tour" },
  { value: "trek", label: "Trek" },
  { value: "activity", label: "Activity" },
];

// Geographic tier shown as a browse filter.
export const DEFAULT_SCOPE_OPTIONS = [
  { value: "international", label: "International" },
  { value: "national", label: "National" },
  { value: "karnataka", label: "Karnataka" },
];

const CatalogContext = createContext();
const STORAGE_KEY = "infinityHikers_catalog";

function slugify(label, existing) {
  const base = String(label || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "option";
  let slug = base;
  let n = 2;
  while (existing.some((o) => o.value === slug)) slug = `${base}-${n++}`;
  return slug;
}

export function CatalogProvider({ children }) {
  const [categoryOptions, setCategoryOptions] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (Array.isArray(stored?.categoryOptions) && stored.categoryOptions.length) return stored.categoryOptions;
    } catch {}
    return DEFAULT_CATEGORY_OPTIONS;
  });

  const [scopeOptions, setScopeOptions] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (Array.isArray(stored?.scopeOptions) && stored.scopeOptions.length) return stored.scopeOptions;
    } catch {}
    return DEFAULT_SCOPE_OPTIONS;
  });

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ categoryOptions, scopeOptions })); } catch {}
  }, [categoryOptions, scopeOptions]);

  const addCategory = (label) => setCategoryOptions((prev) => [...prev, { value: slugify(label, prev), label }]);
  const renameCategory = (value, label) => setCategoryOptions((prev) => prev.map((o) => (o.value === value ? { ...o, label } : o)));
  const removeCategory = (value) => setCategoryOptions((prev) => (prev.length > 1 ? prev.filter((o) => o.value !== value) : prev));

  const addScope = (label) => setScopeOptions((prev) => [...prev, { value: slugify(label, prev), label }]);
  const renameScope = (value, label) => setScopeOptions((prev) => prev.map((o) => (o.value === value ? { ...o, label } : o)));
  const removeScope = (value) => setScopeOptions((prev) => (prev.length > 1 ? prev.filter((o) => o.value !== value) : prev));

  const resetCatalog = () => { setCategoryOptions(DEFAULT_CATEGORY_OPTIONS); setScopeOptions(DEFAULT_SCOPE_OPTIONS); };

  return (
    <CatalogContext.Provider value={{
      categoryOptions, addCategory, renameCategory, removeCategory,
      scopeOptions, addScope, renameScope, removeScope,
      resetCatalog,
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
