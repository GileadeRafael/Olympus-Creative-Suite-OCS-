import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import type { Session, User, AuthChangeEvent } from '@supabase/supabase-js';

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authEvent, setAuthEvent] = useState<AuthChangeEvent | null>(null);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

  useEffect(() => {
    // On initial load, check URL hash for recovery token. This makes the
    // recovery state persistent even if the user reloads the page.
    if (window.location.hash.includes('type=recovery')) {
      setIsPasswordRecovery(true);
    }
    
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
      (event, currentSession) => {
        setAuthEvent(event);
        // When a recovery event is detected, set the recovery state to true.
        // This state will persist until the user signs out or reloads the page
        // after a successful password update.
        if (event === 'PASSWORD_RECOVERY') {
          setIsPasswordRecovery(true);
        } else if (event === 'SIGNED_OUT') {
          // Explicitly reset the state on sign out.
          setIsPasswordRecovery(false);
        }
        updateUserAndSession(currentSession);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return { session, user, authEvent, isPasswordRecovery };
}