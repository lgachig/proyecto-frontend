import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

/* =========================
   AUTH + PROFILE (FIXED)
========================= */

export function useAuth() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId) => {
    if (!userId) {
      setProfile(null);
      return;
    }

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    setProfile(data ?? null);
  };

  const refetchProfile = useCallback(async () => {
    if (!user?.id) {
      setProfile(null);
      return;
    }
    await fetchProfile(user.id);
  }, [user]);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        await fetchProfile(currentUser.id);
      } else {
        setProfile(null);
      }

      setLoading(false);
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;

      setUser(currentUser);

      if (currentUser) {
        await fetchProfile(currentUser.id);
      } else {
        // 🔥 CLAVE: limpiar estado cuando no hay sesión
        setProfile(null);
      }

      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { user, profile, loading, refetchProfile };
}

/* =========================
   REGISTER (OK)
========================= */

export const register = async ({
  email,
  password,
  full_name,
  institutional_id,
  role_id,
}) => {
  const { data: authData, error: authError } =
    await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
          institutional_id,
          role_id,
        },
      },
    });

  if (authError) throw authError;

  const { error: profileError } = await supabase.from('profiles').insert({
    id: authData.user.id,
    full_name,
    institutional_id,
    role_id,
    is_active: true,
    updated_at: new Date().toISOString(),
  });

  if (profileError) throw profileError;

  return authData;
};

/* =========================
   CURRENT USER (SIMPLIFIED)
========================= */

export function useCurrentUser() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data?.session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return user;
}