import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useZones() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchZones() {
      const { data: zones } = await supabase.from('parking_zones').select('*');
      setData(zones || []);
      setIsLoading(false);
    }
    fetchZones();
  }, []);

  return { data, isLoading };
}

export function useSlots() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSlots = useCallback(async () => {
    const { data: slots, error } = await supabase
      .from('parking_slots')
      .select('*')
      .order('number', { ascending: true });
    
    if (!error) setData(slots);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchSlots();

    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'parking_slots' }, 
        () => fetchSlots()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchSlots]);

  return { data, isLoading, refetch: fetchSlots };
}

export function useReserveSlot() {
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
        alert("Ya tienes una reserva activa.");
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

    } catch (err) {
      console.error(err);
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

export function useActiveSession(userId) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchSession = async () => {
      const { data: session } = await supabase
        .from('parking_slots')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      setData(session);
      setIsLoading(false);
    };

    fetchSession();

    const channel = supabase
      .channel(`user-session-${userId}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'parking_slots', filter: `user_id=eq.${userId}` }, 
        (payload) => {
          setData(payload.new || null);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return { data, isLoading };
}