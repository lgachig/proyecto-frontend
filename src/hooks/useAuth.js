// src/hooks/useAuth.js
"use client";
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      // Intentar obtener sesión actual
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    initialize();

    // Escuchar cambios (login, logout, token refrescado automáticamente)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth Event:", event);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (event === 'SIGNED_OUT') {
        // Limpiar cache de la página al salir
        window.location.href = '/login';
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading };
}

export const register = async ({ email, password, full_name, institutional_id, role_id }) => {
  // 1. REGISTRO EN AUTH (Sistema de acceso)
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name,
        institutional_id,
        role_id,
      }
    }
  });

  if (authError) throw authError;

  // 2. REGISTRO EN LA TABLA PROFILES (Donde viste los NULL)
  // Usamos el ID que nos dio el paso anterior
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: authData.user.id, // Vincula el perfil con el usuario de Auth
      full_name: full_name,
      institutional_id: institutional_id,
      role_id: role_id,
      is_active: true,
      updated_at: new Date().toISOString(),
    });

  if (profileError) {
    // Si falla el perfil, podríamos tener un problema de consistencia
    console.error("Error al crear el perfil en la tabla:", profileError);
    throw profileError;
  }

  return authData;
};

export function useCurrentUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Obtener sesión actual al cargar
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    // 2. Escuchar cambios en la sesión (Login/Logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return user; // Devuelve el objeto del usuario o null
}