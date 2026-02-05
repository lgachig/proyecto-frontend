import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

/* =========================
   HELPERS EXPORTADOS (Para usar fuera si es necesario)
========================= */
export const login = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
};

export const register = async ({ email, password, full_name, role_id }) => {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name,
        role_id,
      },
    },
  });

  if (authError) throw authError;

  // Si se crea el usuario, intentamos crear el perfil
  if (authData?.user) {
    const { error: profileError } = await supabase.from('profiles').insert({
      id: authData.user.id,
      full_name,
      email, // Guardamos el email para referencia rápida
      role_id,
      is_active: true,
      updated_at: new Date().toISOString(),
    });
    // Logueamos error pero no bloqueamos el flujo principal
    if (profileError) console.error("Error creating profile:", profileError);
  }

  return authData;
};

/* =========================
   HOOK PRINCIPAL
========================= */
export function useAuth() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId) => {
    try {
      if (!userId) {
        setProfile(null);
        return;
      }
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      // Ignoramos error si es "no hay filas" (PGRST116), el perfil podría crearse después
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
      }
      setProfile(data ?? null);
    } catch (err) {
      console.error('Unexpected error in fetchProfile:', err);
    }
  };

  const refetchProfile = useCallback(async () => {
    if (user?.id) await fetchProfile(user.id);
  }, [user]);

  // Wrappers internos para compatibilidad con el nuevo diseño
  const signIn = async (email, password) => login(email, password);
  
  const signUp = async (email, password, fullName) => {
    return register({ 
      email, 
      password, 
      full_name: fullName, 
      role_id: 'r001' // Por defecto estudiante
    });
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` }
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

    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;

        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        }
      } catch (e) {
        console.error('Auth init failed:', e);
      } finally {
        if (mounted) setLoading(false); // CRÍTICO: Siempre termina de cargar
      }
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        // Solo recargar si cambia el usuario para evitar loops
        if (currentUser.id !== user?.id) await fetchProfile(currentUser.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [user?.id]); // Dependencia ligera

  return { 
    user, 
    profile, 
    loading, 
    refetchProfile,
    signIn, 
    signUp,
    signInWithGoogle,
    logout
  };
}

// Mantenemos esto por compatibilidad si lo usas en otro lado
export function useCurrentUser() {
  const { user } = useAuth();
  return user;
}