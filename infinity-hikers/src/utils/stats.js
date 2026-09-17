/**
 * Real, auto-updating headline numbers derived from actual catalog/review
 * data — replaces hand-typed marketing constants that drifted out of sync
 * with the real catalog and with each other (see MOCK_DATA_AUDIT.md).
 */

/** Count of active tours — a real, live number instead of a fixed "50+". */
export function getDestinationsCoveredCount(itineraries) {
  return itineraries.filter((i) => i.status === "active").length;
}

/**
 * Average of every published testimonial's rating, rounded to 1 decimal.
 * Ties the headline "Average Rating" to what the admin has actually
 * published as reviews, instead of a hand-typed constant. Falls back to
 * `fallback` only when there are no testimonials to average at all.
 */
export function getAverageTestimonialRating(testimonials, fallback = 5) {
  if (!testimonials || testimonials.length === 0) return fallback;
  const sum = testimonials.reduce((acc, t) => acc + (Number(t.rating) || 0), 0);
  return Math.round((sum / testimonials.length) * 10) / 10;
}
