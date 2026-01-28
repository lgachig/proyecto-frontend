import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

async function fetchZones() {
  const { data } = await supabase.from('parking_zones').select('*');
  return data ?? [];
}

async function fetchSlots() {
  const { data, error } = await supabase
    .from('parking_slots')
    .select('*')
    .order('number', { ascending: true });
  if (error) return [];
  return data ?? [];
}

export function useZones() {
  const q = useQuery({
    queryKey: ['zones'],
    queryFn: fetchZones,
    staleTime: 1000 * 60 * 10,
  });
  return { data: q.data ?? [], isLoading: q.isLoading };
}

export function useSlots() {
  const queryClient = useQueryClient();
  const q = useQuery({
    queryKey: ['slots'],
    queryFn: fetchSlots,
    staleTime: 1000 * 60 * 2,
  });

  useEffect(() => {
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'parking_slots' }, () => {
        queryClient.invalidateQueries({ queryKey: ['slots'] });
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [queryClient]);

  return { data: q.data ?? [], isLoading: q.isLoading, refetch: q.refetch };
}

async function fetchReservationHistory(userId) {
  if (!userId) return [];
  const { data, error } = await supabase
    .from('parking_sessions')
    .select(
      `
      id, start_time, end_time, status,
      parking_slots (number, latitude, longitude)
    `
    )
    .eq('user_id', userId)
    .order('start_time', { ascending: false });
  if (error) return [];
  return data ?? [];
}

export function useReservationHistory(userId) {
  const q = useQuery({
    queryKey: ['reservations', userId],
    queryFn: () => fetchReservationHistory(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
  return { data: q.data ?? [], isLoading: q.isLoading };
}

export function useReserveSlot() {
  const queryClient = useQueryClient();
  const [isMutating, setIsMutating] = useState(false);

  const mutate = async ({ slotId, userId }) => {
    setIsMutating(true);
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role_id, reservations_this_week')
        .eq('id', userId)
        .single();

      if (profile?.role_id === 'r001' && (profile?.reservations_this_week || 0) >= 3) {
        await supabase.from('notifications').insert({
          user_id: userId,
          title: "❌ LÍMITE ALCANZADO",
          message: "Has agotado tus 3 reservas semanales permitidas.",
          type: 'danger',
          role_target: 'user'
        });
        return;
      }

      const { data: activeSlot } = await supabase
        .from('parking_slots')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (activeSlot) {
        return;
      }

      const { error: slotError } = await supabase
        .from('parking_slots')
        .update({ status: 'occupied', user_id: userId })
        .eq('id', slotId);

      if (slotError) throw slotError;

      await supabase.from('profiles')
        .update({ reservations_this_week: (profile.reservations_this_week || 0) + 1 })
        .eq('id', userId);

      await supabase.from('parking_sessions').insert([{
        user_id: userId,
        slot_id: slotId,
        start_time: new Date().toISOString(),
        status: 'active'
      }]);

      await supabase.from('notifications').insert({
        user_id: userId,
        title: "✅ YA HAS ESTACIONADO",
        message: `El parqueadero ${slotId} ha sido asignado. Tienes 15 minutos para llegar.`,
        type: 'success',
        role_target: 'user'
      });

      queryClient.invalidateQueries({ queryKey: ['slots'] });
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      setIsMutating(false);
    }
  };

  return { mutate, isMutating };
}

export function useReleaseSlot() {
  const [isFinishing, setIsFinishing] = useState(false);

  const release = async (slotId, userId) => {
    setIsFinishing(true);
    try {
      await supabase
        .from('parking_slots')
        .update({ status: 'available', user_id: null })
        .eq('id', slotId);

      await supabase
        .from('parking_sessions')
        .update({ status: 'completed', end_time: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('status', 'active');

      await supabase.from('notifications').insert({
        user_id: userId,
        title: "ℹ️ SESIÓN FINALIZADA",
        message: "Has liberado el espacio correctamente.",
        type: 'info',
        role_target: 'user'
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsFinishing(false);
    }
  };

  return { release, isFinishing };
}

async function fetchActiveSession(userId) {
  if (!userId) return null;
  const { data } = await supabase
    .from('parking_slots')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  return data ?? null;
}

export function useActiveSession(userId) {
  const queryClient = useQueryClient();
  const q = useQuery({
    queryKey: ['activeSession', userId],
    queryFn: () => fetchActiveSession(userId),
    enabled: !!userId,
    staleTime: 1000 * 30,
  });

  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`user-session-${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'parking_slots' }, () => {
        queryClient.invalidateQueries({ queryKey: ['activeSession', userId] });
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [userId, queryClient]);

  return { data: q.data ?? null, isLoading: q.isLoading };
}