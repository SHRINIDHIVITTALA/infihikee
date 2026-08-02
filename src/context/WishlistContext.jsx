import { createContext, useContext, useState } from "react";

const WishlistContext = createContext();
const KEY = "infinityHikers_wishlist";

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem(KEY) || "[]");
      return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : [];
    }
    catch { return []; }
  });

  const toggle = (id) => {
    setWishlist(prev => {
      const next = prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id];
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* storage is unavailable */ }
      return next;
    });
  };

  return (
    <WishlistContext.Provider value={{ wishlist, toggle, isWished: (id) => wishlist.includes(id), count: wishlist.length }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be within WishlistProvider");
  return ctx;
}
