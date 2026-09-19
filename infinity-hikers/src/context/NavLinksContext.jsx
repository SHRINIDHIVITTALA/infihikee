import { createContext, useContext, useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabaseClient";

// Top navbar links and the footer's "Quick Links" column — admin-editable
// so a new page/route (like Treks) doesn't need a code change to appear in
// navigation. Mobile bottom-nav icons stay code-defined since each one is
// tied to a specific icon.
export const DEFAULT_NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/destinations", label: "Destinations" },
  { to: "/treks", label: "Treks" },
  { to: "/pilgrimages", label: "Pilgrimages" },
  { to: "/trip-planner", label: "Planner" },
];

export const DEFAULT_FOOTER_LINKS = [
  { to: "/", label: "Home" },
  { to: "/destinations", label: "Destinations" },
  { to: "/treks", label: "Treks" },
  { to: "/pilgrimages", label: "Pilgrimages" },
  { to: "/trip-planner", label: "Trip Planner" },
  { to: "/map", label: "Explore Map" },
  { to: "/community", label: "Community" },
];

const NavLinksContext = createContext();

export function NavLinksProvider({ children }) {
  const [navLinks, setNavLinks] = useState(DEFAULT_NAV_LINKS);
  const [footerLinks, setFooterLinks] = useState(DEFAULT_FOOTER_LINKS);
  // Link labels/paths are edited keystroke-by-keystroke, so writes are
  // debounced rather than sent on every change — see the effect below.
  const [saveError, setSaveError] = useState("");
  // Bumped on every successful debounced save so the admin panel can show a
  // brief "Saved" confirmation — otherwise a link edit that succeeds gives
  // no feedback at all (only failures were visible before this).
  const [savedAt, setSavedAt] = useState(null);
  const debounceRef = useRef(null);
  // True only when a mutator below actually ran — NOT set by the initial
  // Supabase fetch's setState. Every page (not just the admin panel) mounts
  // this provider, so without this guard the persist effect below would fire
  // an update attempt on every single page load for every visitor, the
  // moment the fetched data lands in state.
  const dirtyRef = useRef(false);

  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;
    supabase
      .from("site_config")
      .select("nav_links, footer_links")
      .eq("id", 1)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled || dirtyRef.current) return;
        if (error) {
          console.warn("Could not load menus/links from Supabase, showing built-in defaults:", error.message);
        } else if (data) {
          if (data.nav_links?.length) setNavLinks(data.nav_links);
          if (data.footer_links?.length) setFooterLinks(data.footer_links);
        }
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!dirtyRef.current) return;
    if (!supabase) {
      debounceRef.current = setTimeout(() => {
        setSaveError("Saving isn't set up yet — add VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY in .env.");
      }, 0);
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const { error } = await supabase
        .from("site_config")
        .update({ nav_links: navLinks, footer_links: footerLinks })
        .eq("id", 1);
      setSaveError(error ? `Couldn't save menus/links: ${error.message}` : "");
      if (!error) setSavedAt(Date.now());
    }, 600);
    return () => clearTimeout(debounceRef.current);
  }, [navLinks, footerLinks]);

  // Every mutator marks the state dirty before touching it, so the persist
  // effect above can tell "an admin changed this" apart from "the initial
  // fetch just landed" — see dirtyRef's comment.
  const addLink = (setter) => (link) => { dirtyRef.current = true; setter((prev) => [...prev, link]); };
  const updateLink = (setter) => (idx, updates) => {
    dirtyRef.current = true;
    setter((prev) => prev.map((l, i) => (i === idx ? { ...l, ...updates } : l)));
  };
  const removeLink = (setter) => (idx) => { dirtyRef.current = true; setter((prev) => prev.filter((_, i) => i !== idx)); };
  const moveLink = (setter) => (idx, dir) => {
    dirtyRef.current = true;
    setter((prev) => {
      const next = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  };

  const resetNavLinks = () => { dirtyRef.current = true; setNavLinks(DEFAULT_NAV_LINKS); setFooterLinks(DEFAULT_FOOTER_LINKS); };

  return (
    <NavLinksContext.Provider value={{
      navLinks,
      addNavLink: addLink(setNavLinks), updateNavLink: updateLink(setNavLinks),
      removeNavLink: removeLink(setNavLinks), moveNavLink: moveLink(setNavLinks),
      footerLinks,
      addFooterLink: addLink(setFooterLinks), updateFooterLink: updateLink(setFooterLinks),
      removeFooterLink: removeLink(setFooterLinks), moveFooterLink: moveLink(setFooterLinks),
      resetNavLinks, navLinksSaveError: saveError, navLinksSavedAt: savedAt,
    }}>
      {children}
    </NavLinksContext.Provider>
  );
}

export function useNavLinks() {
  const ctx = useContext(NavLinksContext);
  if (!ctx) throw new Error("useNavLinks must be used within NavLinksProvider");
  return ctx;
}
