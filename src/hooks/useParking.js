import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

/* =========================
   ZONES
========================= */

async function fetchZones() {
  const { data } = await supabase.from('parking_zones').select('*');
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

/* =========================
   SLOTS
========================= */

async function fetchSlots() {
  const { data, error } = await supabase
    .from('parking_slots')
    .select('*')
    .order('number', { ascending: true });

  if (error) return [];
  return data ?? [];
}

export function useSlots() {
  const queryClient = useQueryClient();

  const q = useQuery({
    queryKey: ['slots'],
    queryFn: fetchSlots,
    staleTime: 0,
  });

  useEffect(() => {
    const channel = supabase
      .channel('realtime-slots')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'parking_slots' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['slots'] });
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [queryClient]);

  return { data: q.data ?? [], isLoading: q.isLoading };
}

/* =========================
   RESERVATION HISTORY
========================= */

async function fetchReservationHistory(userId) {
  if (!userId) return [];

  const { data, error } = await supabase
    .from('parking_sessions')
    .select(`
      id,
      start_time,
      end_time,
      status,
      parking_slots (
        id,
        number,
        latitude,
        longitude
      )
    `)
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
      .channel(`realtime-reservations-${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'parking_sessions' },
        () => {
          queryClient.invalidateQueries({
            queryKey: ['reservations', userId],
          });
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [userId, queryClient]);

  return { data: q.data ?? [], isLoading: q.isLoading };
}

/* =========================
   ACTIVE SESSION (FIXED)
========================= */

async function fetchActiveSession(userId) {
  if (!userId) return null;

  const { data } = await supabase
    .from('parking_sessions')
    .select(`
      id,
      start_time,
      status,
      parking_slots (
        id,
        number,
        latitude,
        longitude
      )
    `)
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
      .channel(`realtime-active-session-${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'parking_sessions' },
        () => {
          queryClient.invalidateQueries({
            queryKey: ['activeSession', userId],
          });
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [userId, queryClient]);

  return { data: q.data ?? null, isLoading: q.isLoading };
}

/* =========================
   RESERVE SLOT
========================= */

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

      if (profile?.role_id === 'r001' && (profile.reservations_this_week || 0) >= 3) {
        return;
      }

      await supabase
        .from('parking_slots')
        .update({ status: 'occupied', user_id: userId })
        .eq('id', slotId);

      await supabase
        .from('profiles')
        .update({
          reservations_this_week: (profile.reservations_this_week || 0) + 1,
        })
        .eq('id', userId);

      await supabase.from('parking_sessions').insert({
        user_id: userId,
        slot_id: slotId,
        start_time: new Date().toISOString(),
        status: 'active',
      });

      queryClient.invalidateQueries({ queryKey: ['slots'] });
      queryClient.invalidateQueries({ queryKey: ['activeSession', userId] });
      queryClient.invalidateQueries({ queryKey: ['reservations', userId] });

    } finally {
      setIsMutating(false);
    }
  };

  return { mutate, isMutating };
}

/* =========================
   RELEASE SLOT (ADMIN / USER)
========================= */

export function useReleaseSlot() {
  const queryClient = useQueryClient();
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
        .update({
          status: 'completed',
          end_time: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('status', 'active');

      queryClient.invalidateQueries({ queryKey: ['slots'] });
      queryClient.invalidateQueries({ queryKey: ['activeSession'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['reservations'], exact: false });

    } finally {
      setIsFinishing(false);
    }
  };

  return { release, isFinishing };
}