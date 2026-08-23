// Top-level trip type. Distinct from `activityType` (cultural/beach/trekking/
// premium), which describes the experience style within a type.
export const CATEGORY_OPTIONS = [
  { value: "tour", label: "Tour" },
  { value: "trek", label: "Trek" },
  { value: "activity", label: "Activity" },
];

// Geographic tier shown as a browse filter.
export const SCOPE_OPTIONS = [
  { value: "international", label: "International" },
  { value: "national", label: "National" },
  { value: "karnataka", label: "Karnataka" },
];

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
 */
export function deriveScope(country, destination) {
  const c = String(country || "").trim().toLowerCase();
  if (!c) return "international";
  if (c !== "india") return "international";
  const haystack = `${country} ${destination || ""}`.toLowerCase();
  const isKarnataka = KARNATAKA_HINTS.some((hint) => haystack.includes(hint));
  return isKarnataka ? "karnataka" : "national";
}
