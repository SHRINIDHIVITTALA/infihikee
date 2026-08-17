/**
 * Hero slides can leave fields blank to inherit them from their linked tour,
 * so a slide can be nothing more than `{ tourId, status }` and still render.
 * Anything filled in on the slide always wins over the tour's value.
 *
 * `tagline` is deliberately never inherited — it is hero-specific copy, and a
 * tour description is far too long to sit under the banner headline.
 */
export function resolveHeroSlide(slide, tour) {
  const linked = tour || null;
  return {
    ...slide,
    dest: slide.dest || (linked?.destination ? linked.destination.toUpperCase() : ""),
    country: slide.country || linked?.country || "",
    tagline: slide.tagline || "",
    image: slide.image || linked?.image || "",
    dates: slide.dates || linked?.dates || "",
    // The "View …" button is only safe to show while the tour is live
    tourAvailable: Boolean(linked && linked.status === "active"),
  };
}

/** Index tours by id so slides can look up their link in one pass. */
export function indexToursById(itineraries) {
  const map = new Map();
  for (const tour of itineraries) map.set(tour.id, tour);
  return map;
}
