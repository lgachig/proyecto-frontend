import { useState, useEffect } from 'react';
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

  const fetchSlots = async () => {
    const { data: slots, error } = await supabase
      .from('parking_slots')
      .select('*')
      .order('number', { ascending: true });
    
    if (!error) setData(slots);
    setIsLoading(false);
  };

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
  }, []);

  return { data, isLoading };
}

export function useReserveSlot() {
  const [isMutating, setIsMutating] = useState(false);

  const mutate = async ({ slotId, userId }) => {
    setIsMutating(true);
    try {
      // 1. Obtener perfil para verificar rol y reservas actuales
      const { data: profile } = await supabase
        .from('profiles')
        .select('role_id, reservations_this_week')
        .eq('id', userId)
        .single();

      // 2. Validar límite si es Estudiante (r001)
      if (profile?.role_id === 'r001' && profile?.reservations_this_week >= 3) {
        alert("Has alcanzado tu límite de 3 reservas por semana.");
        return;
      }

      // 3. Verificar si ya tiene una reserva activa
      const { data: activeSlot } = await supabase
        .from('parking_slots')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (activeSlot) {
        alert("Ya tienes una reserva activa.");
        return;
      }

      // 4. Realizar la reserva
      const { error: slotError } = await supabase
        .from('parking_slots')
        .update({ status: 'occupied', user_id: userId })
        .eq('id', slotId);

      if (slotError) throw slotError;

      // 5. Incrementar el contador en el perfil
      await supabase.rpc('increment_reservation_count', { user_id: userId }); 
      // O directamente:
      await supabase.from('profiles')
        .update({ reservations_this_week: (profile.reservations_this_week || 0) + 1 })
        .eq('id', userId);

      // 6. Insertar sesión
      await supabase.from('parking_sessions').insert([{
        user_id: userId,
        slot_id: slotId,
        start_time: new Date().toISOString(),
        status: 'active'
      }]);

      alert("Parqueadero asignado correctamente");
      await supabase.from('notifications').insert({
        user_id: userId,
        title: "✅ RESERVA CONFIRMADA",
        message: `Tu espacio ha sido reservado con éxito. Tienes 15 minutos para llegar.`,
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

export function useActiveSession(userId) {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!userId) return;

    const checkSession = async () => {
      const { data: session } = await supabase
        .from('parking_slots')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      setData(session);
    };

    checkSession();
  }, [userId]);

  return { data };
}