import { createContext, useContext, useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";

// Real, server-verified admin auth via Supabase Auth. Replaces the old
// client-side password check (a plain string shipped in the JS bundle,
// readable by anyone regardless of where it was stored before build).
// The admin user is created once in the Supabase dashboard
// (Authentication > Users > Add user) — this app never signs anyone up.
const AdminAuthContext = createContext();

export function AdminAuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    if (!supabase) {
      return { error: "Admin login isn't configured yet — set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env." };
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message };
  };

  const signOut = async () => {
    if (supabase) await supabase.auth.signOut();
    setSession(null);
  };

  return (
    <AdminAuthContext.Provider value={{
      session, isAuthed: Boolean(session), loading, isSupabaseConfigured: isSupabaseConfigured(),
      signIn, signOut,
    }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
