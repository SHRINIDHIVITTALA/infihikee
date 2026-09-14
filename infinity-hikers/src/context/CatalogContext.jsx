import { createContext, useContext, useState, useEffect } from "react";

// Top-level trip type. Distinct from `activityType` (cultural/beach/trekking/
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
const STORAGE_KEY = "infinityHikers_catalog";

// Bump whenever a new option is added to the defaults above, and list exactly
// what that version introduces. Anyone who has already used the admin panel has
// their own list frozen in localStorage, so new defaults would otherwise never
// reach them. Only the listed additions are merged — never "every default that
// happens to be missing", or options the admin deleted would come back.
const CATALOG_VERSION = 2;
const ADDED_IN = { 2: ["pilgrimage"] };

function readStored() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    return stored && typeof stored === "object" ? stored : null;
  } catch {
    return null;
  }
}

function migrate(saved, defaults, storedVersion) {
  if (!Array.isArray(saved) || !saved.length) return defaults;
  if (storedVersion >= CATALOG_VERSION) return saved;
  const have = new Set(saved.map((o) => o.value));
  const introduced = new Set(
    Object.entries(ADDED_IN)
      .filter(([v]) => Number(v) > storedVersion)
      .flatMap(([, values]) => values)
  );
  const missing = defaults.filter((o) => introduced.has(o.value) && !have.has(o.value));
  return missing.length ? [...saved, ...missing] : saved;
}

function slugify(label, existing) {
  const base = String(label || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "option";
  let slug = base;
  let n = 2;
  while (existing.some((o) => o.value === slug)) slug = `${base}-${n++}`;
  return slug;
}

export function CatalogProvider({ children }) {
  const [categoryOptions, setCategoryOptions] = useState(() => {
    const stored = readStored();
    return migrate(stored?.categoryOptions, DEFAULT_CATEGORY_OPTIONS, stored?.version || 1);
  });

  const [scopeOptions, setScopeOptions] = useState(() => {
    const stored = readStored();
    return migrate(stored?.scopeOptions, DEFAULT_SCOPE_OPTIONS, stored?.version || 1);
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: CATALOG_VERSION, categoryOptions, scopeOptions }));
    } catch {}
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
