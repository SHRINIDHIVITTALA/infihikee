import { createContext, useContext, useState, useEffect } from "react";

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
const STORAGE_KEY = "infinityHikers_navLinks";

// Bump when a new default link is added, and list exactly what that version
// introduces. Existing admins have their own (reordered, possibly pruned) list
// saved, so new routes would never surface for them otherwise. Only the listed
// additions are merged — never "every default that happens to be missing", or
// links the admin deliberately deleted would come back.
const NAV_VERSION = 2;
const ADDED_IN = { 2: ["/pilgrimages"] };

function readStored() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    return stored && typeof stored === "object" ? stored : null;
  } catch {
    return null;
  }
}

function migrateLinks(saved, defaults, storedVersion) {
  if (!Array.isArray(saved) || !saved.length) return defaults;
  if (storedVersion >= NAV_VERSION) return saved;
  const have = new Set(saved.map((l) => l.to));
  const introduced = new Set(
    Object.entries(ADDED_IN)
      .filter(([v]) => Number(v) > storedVersion)
      .flatMap(([, tos]) => tos)
  );
  const missing = defaults.filter((l) => introduced.has(l.to) && !have.has(l.to));
  if (!missing.length) return saved;
  // Slot each new link next to its neighbour in the defaults rather than
  // dumping it at the end, so a reordered menu still reads sensibly
  const next = [...saved];
  for (const link of missing) {
    const prevDefault = defaults[defaults.indexOf(link) - 1];
    const at = prevDefault ? next.findIndex((l) => l.to === prevDefault.to) : -1;
    if (at === -1) next.push(link);
    else next.splice(at + 1, 0, link);
  }
  return next;
}

export function NavLinksProvider({ children }) {
  const [navLinks, setNavLinks] = useState(() => {
    const stored = readStored();
    return migrateLinks(stored?.navLinks, DEFAULT_NAV_LINKS, stored?.version || 1);
  });

  const [footerLinks, setFooterLinks] = useState(() => {
    const stored = readStored();
    return migrateLinks(stored?.footerLinks, DEFAULT_FOOTER_LINKS, stored?.version || 1);
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: NAV_VERSION, navLinks, footerLinks }));
    } catch {}
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
