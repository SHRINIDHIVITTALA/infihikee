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

const MASONRY_TARGET_TILE_COUNT = 18;

/**
 * Builds the Masonry background tile list for a resolved hero slide. An
 * admin can set specific background photos per slide; if left blank it
 * falls back to the linked tour's gallery, then the slide's single banner
 * image. Masonry is a static (non-looping) grid, unlike the old drifting
 * wall — a tour with only 2-3 photos would otherwise fill just the top
 * corner and leave the rest of the hero black, so the same photos are
 * cycled through enough tiles to keep the whole background covered
 * regardless of gallery size.
 */
export function buildMasonryItems(slide, linkedTour) {
  const images = Array.isArray(slide?.backgroundImages) && slide.backgroundImages.length
    ? slide.backgroundImages
    : linkedTour && Array.isArray(linkedTour.gallery) && linkedTour.gallery.length
    ? linkedTour.gallery
    : slide?.image
    ? [slide.image]
    : [];
  if (!images.length) return [];

  const repeats = Math.max(1, Math.ceil(MASONRY_TARGET_TILE_COUNT / images.length));
  const tiles = [];
  for (let r = 0; r < repeats; r++) {
    images.forEach((image, i) => {
      const n = tiles.length;
      // Heights have no real aspect-ratio data, so they're varied
      // pseudo-randomly (stable per index) purely for a natural masonry look.
      tiles.push({
        id: `${slide?.tourId || slide?.id}-${r}-${i}`,
        img: image,
        height: 320 + ((n * 137) % 240),
      });
    });
  }
  return tiles;
}
