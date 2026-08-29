// Category and scope option lists now live in CatalogContext (admin-configurable).
// This file keeps only the free-text scope-guessing heuristic, which is
// independent of exactly which scope values the admin has configured.

const KARNATAKA_HINTS = [
  "karnataka", "coorg", "kodagu", "chikmagalur", "chikamagalur", "sakleshpur",
  "agumbe", "kudremukh", "kudremukha", "kodachadri", "dandeli", "gokarna",
  "udupi", "mangalore", "mangaluru", "bangalore", "bengaluru", "mysore",
  "mysuru", "hampi", "badami", "murudeshwar", "murdeshwara", "netravathi",
  "netravati", "yana", "honnavara", "netrani",
];

/**
 * Best-guess scope from a tour's free-text country/destination fields, used
 * only to pre-fill the admin form — the admin always has the final say.
 * Falls back gracefully if the admin has renamed/removed the default scope
 * values: only returns "karnataka"/"national" when those values still exist
 * among the configured scope options.
 */
export function deriveScope(country, destination, scopeOptions) {
  const values = (scopeOptions || []).map((o) => o.value);
  const has = (v) => values.length === 0 || values.includes(v);
  const fallback = has("international") ? "international" : values[0];

  const c = String(country || "").trim().toLowerCase();
  if (!c) return fallback;
  if (c !== "india") return fallback;

  const haystack = `${country} ${destination || ""}`.toLowerCase();
  const isKarnataka = KARNATAKA_HINTS.some((hint) => haystack.includes(hint));
  if (isKarnataka && has("karnataka")) return "karnataka";
  if (has("national")) return "national";
  return fallback;
}
