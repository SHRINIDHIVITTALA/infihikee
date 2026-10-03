import { createContext, useContext, useState } from "react";
import { useToast } from "./ToastContext";

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

  const toast = useToast();

  const apply = (id) => {
    setWishlist(prev => {
      const next = prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id];
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* storage is unavailable */ }
      return next;
    });
  };

  // opts.label names the tour in the toast; opts.silent skips the toast.
  const toggle = (id, opts = {}) => {
    const adding = !wishlist.includes(id);
    apply(id);
    if (opts.silent) return;
    toast({
      title: adding ? "Saved to wishlist" : "Removed from wishlist",
      description: opts.label,
      actionLabel: "Undo",
      onAction: () => apply(id),
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
