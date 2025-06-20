
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener first
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session?.user?.email || "No user");
      
      if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        // Explicitly clear state on sign out or token refresh with null session
        if (!session) {
          console.log("Clearing auth state...");
          setSession(null);
          setUser(null);
        } else {
          setSession(session);
          setUser(session.user);
        }
      } else {
        // For other events, update normally
        setSession(session);
        setUser(session?.user ?? null);
      }
      
      setLoading(false);
    });

    // Then get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error("Error getting session:", error);
      }
      console.log("Initial session:", session?.user?.email || "No user");
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, session, loading };
};
