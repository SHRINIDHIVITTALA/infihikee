import { createContext, useContext, useState } from "react";
import { useToast } from "./ToastContext";

const CompareContext = createContext();

export function CompareProvider({ children }) {
  const [compareList, setCompareList] = useState([]);

  const toast = useToast();

  // opts.label names the tour in the toast; opts.silent skips the toast.
  const toggle = (id, opts = {}) => {
    const before = compareList;
    const removing = before.includes(id);
    setCompareList(
      removing ? before.filter(i => i !== id)
      : before.length >= 2 ? [before[1], id] // slide window
      : [...before, id]
    );
    if (opts.silent) return;
    toast({
      title: removing ? "Removed from compare" : "Added to compare",
      description: !removing && before.length >= 2 ? "Replaced your oldest pick" : opts.label,
      actionLabel: "Undo",
      onAction: () => setCompareList(before),
    });
  };

  const clear = () => setCompareList([]);
  const isComparing = (id) => compareList.includes(id);

  return (
    <CompareContext.Provider value={{ compareList, toggle, clear, isComparing }}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare must be within CompareProvider");
  return ctx;
}
