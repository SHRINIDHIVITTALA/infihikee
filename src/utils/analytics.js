/**
 * Analytics utility for Infinity Hikers
 * Supports GA4, Hotjar, and simple A/B testing
 */

// ──── GA4 ────
const GA_ID = "G-XXXXXXXXXX"; // Replace with real GA4 measurement ID

export function initGA4() {
  if (typeof window === "undefined" || window.__ga4Loaded) return;
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag("js", new Date());
  gtag("config", GA_ID, { send_page_view: false });
  window.__ga4Loaded = true;
}

export function trackPageView(path, title) {
  if (window.gtag) {
    window.gtag("event", "page_view", {
      page_path: path,
      page_title: title,
    });
  }
}

export function trackEvent(eventName, params = {}) {
  if (window.gtag) {
    window.gtag("event", eventName, params);
  }
}

// Conversion funnel events
export const FUNNEL_EVENTS = {
  VIEW_DESTINATION: "view_destination",
  START_CALCULATOR: "start_calculator",
  COMPLETE_ESTIMATE: "complete_estimate",
  START_TRIP_PLANNER: "start_trip_planner",
  COMPLETE_TRIP_PLANNER: "complete_trip_planner",
  OPEN_CHATBOT: "open_chatbot",
  CLICK_BOOK_NOW: "click_book_now",
  CLICK_WHATSAPP: "click_whatsapp",
  CLICK_CALL: "click_call",
};

// ──── Hotjar ────
const HOTJAR_ID = 0; // Replace with real Hotjar site ID

export function initHotjar() {
  if (typeof window === "undefined" || !HOTJAR_ID || window.__hjLoaded) return;
  (function (h, o, t, j, a, r) {
    h.hj =
      h.hj ||
      function () {
        (h.hj.q = h.hj.q || []).push(arguments);
      };
    h._hjSettings = { hjid: HOTJAR_ID, hjsv: 6 };
    a = o.getElementsByTagName("head")[0];
    r = o.createElement("script");
    r.async = 1;
    r.src = t + h._hjSettings.hjid + j + h._hjSettings.hjsv;
    a.appendChild(r);
  })(window, document, "https://static.hotjar.com/c/hotjar-", ".js?sv=");
  window.__hjLoaded = true;
}

// ──── A/B Testing ────
const AB_STORAGE_KEY = "infinityHikers_abVariants";

function getStoredVariants() {
  try {
    return JSON.parse(localStorage.getItem(AB_STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

/**
 * Get a consistent A/B variant for a given experiment name.
 * Assigns randomly on first call and persists in localStorage.
 * @param {string} experimentName - e.g. "hero_cta_text"
 * @param {string[]} variants - e.g. ["Book Now", "Start Adventure"]
 * @returns {string} The assigned variant
 */
export function getABVariant(experimentName, variants = ["A", "B"]) {
  const stored = getStoredVariants();
  if (stored[experimentName] !== undefined && variants.includes(stored[experimentName])) {
    return stored[experimentName];
  }
  const variant = variants[Math.floor(Math.random() * variants.length)];
  stored[experimentName] = variant;
  localStorage.setItem(AB_STORAGE_KEY, JSON.stringify(stored));

  // Track assignment
  trackEvent("ab_experiment_assigned", {
    experiment: experimentName,
    variant,
  });

  return variant;
}

/**
 * Initialize all analytics (call once in App mount)
 */
export function initAnalytics() {
  initGA4();
  initHotjar();
}
