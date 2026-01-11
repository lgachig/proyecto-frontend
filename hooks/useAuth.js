'use client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { login, register, supabase} from '../lib/supabaseClient';


export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (credentials) => login(credentials), 
    
    onSuccess: (data) => { 
      // 1. Save to the React Query Global Cache
      queryClient.setQueryData(['authUser'], data.user);
      
      // 2. Physical persistence (for when the page is reloaded)
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.session.access_token);
      
      window.dispatchEvent(new Event('userUpdated'));
      console.log('Login exitoso:', data.user.user_metadata.full_name);
      
      router.push('/dashboard');
    },
    onError: (error) => {
      alert('Error de acceso: ' + error.message);
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (userData) => register(userData),
    onSuccess: (data) => {
      if (data.session) {
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.session.access_token);
        queryClient.setQueryData(['authUser'], data.user);
      }
      
      alert('Registro exitoso. Revisa tu correo si la confirmación está activa.');
      router.push('/dashboard');
    },
    onError: (error) => {
      alert('Error en el registro: ' + error.message);
    }
  });
}

export function useCurrentUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (authUser) {
        // We bring in data from the profile and the related vehicle
        const { data: profile } = await supabase
            .from('profiles')
            .select(`
              *,
              vehicles!vehicles_user_id_fkey (*)
            `)
            .eq('id', authUser.id)
            .single();

        setUser({
          ...authUser,
          ...profile,
          vehicle: profile?.vehicles?.[1] || null
        });
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Error loading user:", err);
    } finally {
      setLoading(false);
    }
  };

  console.log("Fetching current user ", user);

  useEffect(() => {
    fetchUserData();

    // Listen for session changes (such as logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
      } else {
        fetchUserData();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading };
}