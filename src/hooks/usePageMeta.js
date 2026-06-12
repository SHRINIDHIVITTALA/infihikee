import { useEffect } from "react";

const SITE_NAME = "Infinity Hikers";
const DEFAULT_DESC = "Expertly curated group treks, cultural tours & international holidays from Bengaluru. Singapore, Bhutan, Vietnam, Bali and more — all-inclusive packages with flights, hotels & meals.";
const DEFAULT_IMG = "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1200&q=80";

function setTag(attr, name, content) {
  if (!content) return;
  let el = document.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

export function usePageMeta({ title, description, image } = {}) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | Backpacker • Trekking • Nature Trail`;
    const desc = description || DEFAULT_DESC;
    const img = image || DEFAULT_IMG;

    document.title = fullTitle;

    setTag("name", "description", desc);

    setTag("property", "og:title", fullTitle);
    setTag("property", "og:description", desc);
    setTag("property", "og:image", img);
    setTag("property", "og:type", "website");
    setTag("property", "og:site_name", SITE_NAME);

    setTag("name", "twitter:card", "summary_large_image");
    setTag("name", "twitter:title", fullTitle);
    setTag("name", "twitter:description", desc);
    setTag("name", "twitter:image", img);

    return () => {
      document.title = `${SITE_NAME} | Backpacker • Trekking • Nature Trail`;
    };
  }, [title, description, image]);
}
