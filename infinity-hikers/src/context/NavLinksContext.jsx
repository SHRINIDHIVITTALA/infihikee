import { createContext, useContext, useState, useEffect } from "react";

// Top navbar links and the footer's "Quick Links" column — admin-editable
// so a new page/route (like Treks) doesn't need a code change to appear in
// navigation. Mobile bottom-nav icons stay code-defined since each one is
// tied to a specific icon.
export const DEFAULT_NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/destinations", label: "Destinations" },
  { to: "/treks", label: "Treks" },
  { to: "/trip-planner", label: "Planner" },
];

export const DEFAULT_FOOTER_LINKS = [
  { to: "/", label: "Home" },
  { to: "/destinations", label: "Destinations" },
  { to: "/treks", label: "Treks" },
  { to: "/trip-planner", label: "Trip Planner" },
  { to: "/map", label: "Explore Map" },
  { to: "/community", label: "Community" },
];

const NavLinksContext = createContext();
const STORAGE_KEY = "infinityHikers_navLinks";

export function NavLinksProvider({ children }) {
  const [navLinks, setNavLinks] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (Array.isArray(stored?.navLinks) && stored.navLinks.length) return stored.navLinks;
    } catch {}
    return DEFAULT_NAV_LINKS;
  });

  const [footerLinks, setFooterLinks] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (Array.isArray(stored?.footerLinks) && stored.footerLinks.length) return stored.footerLinks;
    } catch {}
    return DEFAULT_FOOTER_LINKS;
  });

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ navLinks, footerLinks })); } catch {}
  }, [navLinks, footerLinks]);

  const addLink = (setter) => (link) => setter((prev) => [...prev, link]);
  const updateLink = (setter) => (idx, updates) =>
    setter((prev) => prev.map((l, i) => (i === idx ? { ...l, ...updates } : l)));
  const removeLink = (setter) => (idx) => setter((prev) => prev.filter((_, i) => i !== idx));
  const moveLink = (setter) => (idx, dir) => setter((prev) => {
    const next = [...prev];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return prev;
    [next[idx], next[target]] = [next[target], next[idx]];
    return next;
  });

  const resetNavLinks = () => { setNavLinks(DEFAULT_NAV_LINKS); setFooterLinks(DEFAULT_FOOTER_LINKS); };

  return (
    <NavLinksContext.Provider value={{
      navLinks,
      addNavLink: addLink(setNavLinks), updateNavLink: updateLink(setNavLinks),
      removeNavLink: removeLink(setNavLinks), moveNavLink: moveLink(setNavLinks),
      footerLinks,
      addFooterLink: addLink(setFooterLinks), updateFooterLink: updateLink(setFooterLinks),
      removeFooterLink: removeLink(setFooterLinks), moveFooterLink: moveLink(setFooterLinks),
      resetNavLinks,
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
