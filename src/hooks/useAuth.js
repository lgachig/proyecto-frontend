import { useEffect, useState, useCallback } from "react";
import { supabase } from '../lib/supabase';

/**
 * Signs in with email and password via Supabase Auth.
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<{ user, session }>}
 */
export const login = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
};

/**
 * Registers a new user and creates a profile row.
 * @param {{ email: string, password: string, full_name: string, role_id: string }} params
 * @returns {Promise<{ user, session }>}
 */
export const register = async ({ email, password, full_name, role_id }) => {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name, role_id } },
  });

  if (authError) throw authError;

  if (authData?.user) {
    await supabase.from('profiles').insert({
      id: authData.user.id,
      full_name,
      email,
      role_id,
      is_active: true,
      updated_at: new Date().toISOString(),
    });
  }
  return authData;
};

/**
 * Auth hook: session, profile, login, register, logout, refetchProfile.
 * Subscribes to auth state and profiles table (realtime) for current user.
 * @returns {{ user, profile, loading, signIn, signUp, signInWithGoogle, logout, refetchProfile }}
 */
export function useAuth() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId) => {
    if (!userId) {
      setProfile(null);
      return;
    }
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    setProfile(data ?? null);
  }, []);

  const refetchProfile = useCallback(() => {
    if (user?.id) return fetchProfile(user.id);
  }, [user?.id, fetchProfile]);

  const signIn = async (email, password) => login(email, password);
  
  const signUp = async (email, password, fullName) => {
    return register({ email, password, full_name: fullName, role_id: 'r001' });
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { 
        redirectTo: `${window.location.origin}/user`, // UNIFICADO A /user
        queryParams: { access_type: 'offline', prompt: 'consent' }
      }
    });
    if (error) throw error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (mounted) {
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        }
        setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        await fetchProfile(currentUser.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel(`profile-realtime-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles", filter: `id=eq.${user.id}` },
        () => fetchProfile(user.id)
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [user?.id, fetchProfile]);

  return { user, profile, loading, signIn, signUp, signInWithGoogle, logout, refetchProfile };
}

// Mantenemos esto por compatibilidad si lo usas en otro lado
export function useCurrentUser() {
  const { user } = useAuth();
  return user;
}