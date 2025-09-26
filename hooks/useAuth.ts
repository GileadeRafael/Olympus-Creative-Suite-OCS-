import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import type { Session, User } from '@supabase/supabase-js';

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // This function atomically updates both user and session state
    // to prevent race conditions where the session is updated before the user object.
    const updateUserAndSession = async (currentSession: Session | null) => {
      if (currentSession?.user) {
        // If a session exists, fetch the latest user data from the server.
        // This ensures user_metadata (like avatar_url) is always fresh.
        const { data: { user: freshUser } } = await supabase.auth.getUser();
        setUser(freshUser);
      } else {
        // If no session, clear the user.
        setUser(null);
      }
      // Only set the session state *after* the user state has been aligned.
      setSession(currentSession);
    };

    // Check for an existing session on initial app load.
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      updateUserAndSession(currentSession);
    });

    // Listen for auth state changes (SIGN_IN, SIGN_OUT, USER_UPDATED).
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        updateUserAndSession(currentSession);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return { session, user };
}