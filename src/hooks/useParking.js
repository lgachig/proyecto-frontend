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

/** Returns zones with realtime, Zustand sync and offline fallback from store. */
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

/** Returns slots with realtime (slots + sessions), Zustand sync and offline fallback from store. */
export function useSlots() {
  const queryClient = useQueryClient();
  const setSlots = useParkingStore((s) => s.setSlots);
  const storeSlots = useParkingStore((s) => s.slots);
  const q = useQuery({
    queryKey: ['slots'],
    queryFn: fetchSlots,
    staleTime: 1000 * 60 * 2,
    placeholderData: (previousData) => previousData,
    retry: 1,
    refetchOnReconnect: true,
  });

  useEffect(() => {
    const data = q.data ?? [];
    if (data.length > 0) setSlots(data);
  }, [q.data, setSlots]);

  useEffect(() => {
    const channel = supabase
      .channel('realtime-slots')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'parking_slots' }, () => {
        queryClient.invalidateQueries({ queryKey: ['slots'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'parking_sessions' }, () => {
        queryClient.invalidateQueries({ queryKey: ['slots'] });
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [queryClient]);

  const data = q.data ?? storeSlots;
  const isLoading = q.isLoading && !storeSlots.length;
  return { data: data ?? [], isLoading };
}

/* =========================
   RESERVATION HISTORY
========================= */
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

export function useReservationHistory(userId) {
  const queryClient = useQueryClient();
  const q = useQuery({
    queryKey: ['reservations', userId],
    queryFn: () => fetchReservationHistory(userId),
    enabled: !!userId,
    staleTime: 0,
  });

  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`realtime-history-${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'parking_sessions' }, () => {
        queryClient.invalidateQueries({ queryKey: ['reservations', userId] });
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [userId, queryClient]);

  return { data: q.data ?? [], isLoading: q.isLoading };
}

/* =========================
   ACTIVE SESSION
========================= */
async function fetchActiveSession(userId) {
  if (!userId) return null;
  const { data } = await supabase
    .from('parking_sessions')
    .select(`id, start_time, status, parking_slots (id, number, latitude, longitude)`)
    .eq('user_id', userId)
    .eq('status', 'active')
    .maybeSingle();
  return data ?? null;
}

export function useActiveSession(userId) {
  const queryClient = useQueryClient();
  const q = useQuery({
    queryKey: ['activeSession', userId],
    queryFn: () => fetchActiveSession(userId),
    enabled: !!userId,
    staleTime: 0,
  });

  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`realtime-active-${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'parking_sessions' }, () => {
        queryClient.invalidateQueries({ queryKey: ['activeSession', userId] });
        queryClient.invalidateQueries({ queryKey: ['slots'] });
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [userId, queryClient]);

  return { data: q.data ?? null, isLoading: q.isLoading };
}

/* =========================
   RELEASE SLOT (CORREGIDO)
========================= */
export function useReleaseSlot() {
  const queryClient = useQueryClient();
  const [isFinishing, setIsFinishing] = useState(false);

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

      // 4. INVALIDACIÓN CRÍTICA (REFRESCA LA UI AL INSTANTE)
      await queryClient.invalidateQueries({ queryKey: ['slots'] });
      await queryClient.invalidateQueries({ queryKey: ['activeSession', userId] });
      await queryClient.invalidateQueries({ queryKey: ['reservations', userId] });
      await queryClient.invalidateQueries({ queryKey: ['profile'] }); // Refresca contador si existe

    } finally {
      setIsFinishing(false);
    }
  };
  return { release, isFinishing };
}

/* =========================
   RESERVE SLOT (CORREGIDO CON CONTADOR + NOTIF)
========================= */
export function useReserveSlot() {
  const queryClient = useQueryClient();
  const [isMutating, setIsMutating] = useState(false);

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

      // 6. INVALIDACIÓN CRÍTICA
      await queryClient.invalidateQueries({ queryKey: ['slots'] });
      await queryClient.invalidateQueries({ queryKey: ['activeSession', userId] });
      await queryClient.invalidateQueries({ queryKey: ['reservations', userId] });
      await queryClient.invalidateQueries({ queryKey: ['profile'] });

    } finally {
      setIsMutating(false);
    }
  };
  return { mutate, isMutating };
}