const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** Parse a yyyy-mm-dd value from a native date input, avoiding timezone shifts. */
function parseISODate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || "").trim());
  if (!match) return null;
  const [, y, m, d] = match;
  const month = Number(m) - 1;
  const day = Number(d);
  if (month < 0 || month > 11 || day < 1 || day > 31) return null;
  return { year: Number(y), month, day };
}

/**
 * Today as yyyy-mm-dd in the user's own timezone.
 * Built from local getters on purpose — toISOString() reports UTC, which in
 * IST (+05:30) still reads as yesterday until 05:30 and would let an admin
 * pick a date that has already passed.
 */
export function todayISO() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

/**
 * Turn two yyyy-mm-dd values into the banner copy shown on the hero slide.
 *   same month  → "August 6 - 11, 2026"
 *   same year   → "August 28 - September 3, 2026"
 *   spans years → "December 28, 2026 - January 3, 2027"
 *   start only  → "August 6, 2026"
 */
export function formatHeroDates(startValue, endValue) {
  const start = parseISODate(startValue);
  const end = parseISODate(endValue);
  if (!start) return "";

  const startFull = `${MONTHS[start.month]} ${start.day}, ${start.year}`;
  if (!end) return startFull;

  if (start.year === end.year && start.month === end.month) {
    // A single-day trip reads as one date, not a range
    if (start.day === end.day) return startFull;
    return `${MONTHS[start.month]} ${start.day} - ${end.day}, ${start.year}`;
  }
  if (start.year === end.year) {
    return `${MONTHS[start.month]} ${start.day} - ${MONTHS[end.month]} ${end.day}, ${start.year}`;
  }
  return `${startFull} - ${MONTHS[end.month]} ${end.day}, ${end.year}`;
}

/**
 * Turn two yyyy-mm-dd values into "dd/mm/yyyy - dd/mm/yyyy" for the trip's
 * own hero pill. Falls back to a single date, or "" if start is missing.
 */
export function formatDDMMYYYY(startValue, endValue) {
  const start = parseISODate(startValue);
  const end = parseISODate(endValue);
  if (!start) return "";

  const pad = (n) => String(n).padStart(2, "0");
  const toDDMMYYYY = (d) => `${pad(d.day)}/${pad(d.month + 1)}/${d.year}`;

  const startStr = toDDMMYYYY(start);
  if (!end) return startStr;
  return `${startStr} - ${toDDMMYYYY(end)}`;
}
