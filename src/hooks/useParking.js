import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useParkingStore } from '../store/parkingStore';

/**
 * Fetches all parking zones from Supabase.
 * @returns {Promise<Array>}
 */
async function fetchZones() {
  const { data } = await supabase.from('parking_zones').select('*');
  return data ?? [];
}

/**
 * Returns parking zones with Realtime updates, syncs to Zustand store, and falls back to store when offline.
 * @returns {{ data: Array, isLoading: boolean }}
 */
export function useZones() {
  const setZones = useParkingStore((s) => s.setZones);
  const storeZones = useParkingStore((s) => s.zones);
  const q = useQuery({
    queryKey: ['zones'],
    queryFn: fetchZones,
    staleTime: 1000 * 60 * 10,
    placeholderData: (previousData) => previousData,
    retry: 1,
    refetchOnReconnect: true,
  });
  useEffect(() => {
    const data = q.data ?? [];
    if (data.length > 0) setZones(data);
  }, [q.data, setZones]);
  const data = q.data ?? storeZones;
  const isLoading = q.isLoading && !storeZones.length;
  return { data: data ?? [], isLoading };
}

/**
 * Fetches all parking slots ordered by number.
 * @returns {Promise<Array>}
 */
async function fetchSlots() {
  const { data, error } = await supabase
    .from('parking_slots')
    .select('*')
    .order('number', { ascending: true });
  if (error) return [];
  return data ?? [];
}

/**
 * Returns parking slots. Realtime updates come from RealtimeSync (single channel); this hook only reads query + store.
 * @returns {{ data: Array, isLoading: boolean }}
 */
export function useSlots() {
  const setSlots = useParkingStore((s) => s.setSlots);
  const storeSlots = useParkingStore((s) => s.slots);

  // 1️⃣ PRIMERO useQuery
  const q = useQuery({
    queryKey: ['slots'],
    queryFn: fetchSlots,
    staleTime: 0,
    placeholderData: (previousData) => previousData,
    retry: 1,
    refetchOnReconnect: true,
  });

  // 2️⃣ DESPUÉS usar q
  useEffect(() => {
    const data = q.data ?? [];
    if (data.length > 0) {
      setSlots(data);
    }
  }, [q.data, setSlots]);

  const data = q.data ?? storeSlots;
  const isLoading = q.isLoading && !storeSlots.length;

  return { data: data ?? [], isLoading };
}

/* =========================
   RESERVATION HISTORY
========================= */

/**
 * Fetches past and current parking sessions for a user, ordered by start_time descending.
 * @param {string} userId
 * @returns {Promise<Array>}
 */
async function fetchReservationHistory(userId) {
  if (!userId) return [];
  const { data, error } = await supabase
    .from('parking_sessions')
    .select(`id, start_time, end_time, status, parking_slots (id, number, latitude, longitude)`)
    .eq('user_id', userId)
    .order('start_time', { ascending: false });
  if (error) return [];
  return data ?? [];
}

/**
 * Returns reservation history for the given user with Realtime refetch on parking_sessions changes.
 * @param {string} userId
 * @returns {{ data: Array, isLoading: boolean }}
 */
/**
 * Returns reservation history for the user. Realtime refetch is done by RealtimeSync.
 */
export function useReservationHistory(userId) {
  const q = useQuery({
    queryKey: ['reservations', userId],
    queryFn: () => fetchReservationHistory(userId),
    enabled: !!userId,
    staleTime: 0,
  });
  return { data: q.data ?? [], isLoading: q.isLoading };
}

/* =========================
   ACTIVE SESSION
========================= */

/**
 * Fetches the current active parking session for a user, if any.
 * @param {string} userId
 * @returns {Promise<object|null>}
 */
async function fetchActiveSession(userId) {
  if (!userId) return null;
  const { data } = await supabase
    .from('parking_sessions')
    .select(`id, slot_id, start_time, status, parking_slots (id, number, latitude, longitude)`)
    .eq('user_id', userId)
    .eq('status', 'active')
    .maybeSingle();
  return data ?? null;
}

/**
 * Returns the active parking session for the user; refetches on parking_sessions Realtime events so admin release is seen instantly.
 * @param {string} userId
 * @returns {{ data: object|null, isLoading: boolean }}
 */
/**
 * Returns active session for the user. Realtime refetch is done by RealtimeSync (admin end session → user sees it at once).
 */
export function useActiveSession(userId) {
  const q = useQuery({
    queryKey: ['activeSession', userId],
    queryFn: () => fetchActiveSession(userId),
    enabled: !!userId,
    staleTime: 0,
  });
  return { data: q.data ?? null, isLoading: q.isLoading };
}

/* =========================
   RELEASE SLOT
========================= */

/**
 * Hook to release (end) a parking session. Frees the slot, completes the session, notifies the user, and refetches all related queries so UI updates in real time.
 * @returns {{ release: (slotId: string, userId: string) => Promise<void>, isFinishing: boolean }}
 */
export function useReleaseSlot() {
  const queryClient = useQueryClient();
  const [isFinishing, setIsFinishing] = useState(false);

  /** Frees the slot and marks the session as completed; triggers immediate refetch for user and admin. */
  const release = async (slotId, userId) => {
    if (!userId) return;
    setIsFinishing(true);
    try {
      // 1. Liberar puesto físico
      await supabase.from('parking_slots').update({ status: 'available', user_id: null }).eq('id', slotId);
      
      // 2. Finalizar sesión histórica
      await supabase.from('parking_sessions').update({
        status: 'completed',
        end_time: new Date().toISOString(),
      }).eq('user_id', userId).eq('status', 'active');

      // 3. INSERTAR NOTIFICACIÓN (ENCIENDE CAMPANA)
      await supabase.from('notifications').insert({
        user_id: userId,
        title: 'SESIÓN FINALIZADA',
        message: 'Has liberado el espacio correctamente.',
        type: 'info',
        is_read: false
      });

      // 4. Force immediate refetch so user and admin see update without waiting for Realtime
      await queryClient.refetchQueries({ queryKey: ['slots'] });
      await queryClient.refetchQueries({ queryKey: ['activeSession', userId] });
      await queryClient.refetchQueries({ queryKey: ['reservations', userId] });
      await queryClient.refetchQueries({ queryKey: ['profile'] });

    } finally {
      setIsFinishing(false);
    }
  };
  return { release, isFinishing };
}

/* =========================
   RESERVE SLOT
========================= */

/**
 * Hook to reserve a parking slot. Occupies the slot, creates an active session, updates weekly count and notifies; refetches so admin and other users see the change in real time.
 * @returns {{ mutate: (params: { slotId: string, userId: string }) => Promise<void>, isMutating: boolean }}
 */
export function useReserveSlot() {
  const queryClient = useQueryClient();
  const [isMutating, setIsMutating] = useState(false);

  /** Reserves the slot for the user and triggers immediate refetch for all clients. */
  const mutate = async ({ slotId, userId }) => {
    if (!userId) return;
    setIsMutating(true);
    try {
      // 1. Obtener datos actuales del perfil para el contador
      const { data: profile } = await supabase.from('profiles').select('reservations_this_week').eq('id', userId).single();
      const currentCount = profile?.reservations_this_week || 0;

      // 2. Ocupar el puesto físico
      await supabase.from('parking_slots').update({ status: 'occupied', user_id: userId }).eq('id', slotId);
      
      // 3. ACTUALIZAR CONTADOR SEMANAL (+1)
      await supabase.from('profiles').update({ reservations_this_week: currentCount + 1 }).eq('id', userId);
      
      // 4. Crear sesión activa
      await supabase.from('parking_sessions').insert({
        user_id: userId,
        slot_id: slotId,
        start_time: new Date().toISOString(),
        status: 'active',
      });

      // 5. INSERTAR NOTIFICACIÓN (ENCIENDE CAMPANA)
      await supabase.from('notifications').insert({
        user_id: userId,
        title: 'SESIÓN ACTIVADA',
        message: 'Tu reserva ha comenzado. Tienes 15 min para llegar.',
        type: 'success',
        is_read: false
      });

      // 6. Force immediate refetch so admin and other users see the new reservation
      await queryClient.refetchQueries({ queryKey: ['slots'] });
      await queryClient.refetchQueries({ queryKey: ['activeSession', userId] });
      await queryClient.refetchQueries({ queryKey: ['reservations', userId] });
      await queryClient.refetchQueries({ queryKey: ['profile'] });

    } finally {
      setIsMutating(false);
    }
  };
  return { mutate, isMutating };
}