import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import SwipeToast from "../components/SwipeToast";
import "./ToastContext.css";

const ToastContext = createContext(() => {});
const MAX_VISIBLE = 3;

// toast({ title, description, actionLabel, onAction, duration })
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(0);

  const toast = useCallback((options) => {
    const id = ++nextId.current;
    setToasts((list) => [...list, { ...options, id }].slice(-MAX_VISIBLE));
  }, []);

  const remove = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const value = useMemo(() => toast, [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-host">
        {toasts.map((t) => (
          <SwipeToast
            key={t.id}
            inline
            title={t.title}
            description={t.description}
            actionLabel={t.actionLabel}
            onAction={t.onAction}
            duration={t.duration ?? 3000}
            background="#1a1a2e"
            color="#ffffff"
            fuseColor="#f97316"
            onClose={() => remove(t.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
