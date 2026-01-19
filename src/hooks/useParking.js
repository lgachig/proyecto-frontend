import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// 1. Hook para obtener las ZONAS de la universidad
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

// 2. Hook para obtener los SLOTS (Puestos) en tiempo real
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

    // SUSCRIPCIÓN REALTIME: Esto hace que el cuadro cambie de color solo
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

// 3. Hook para RESERVAR un espacio
export function useReserveSlot() {
  const [isMutating, setIsMutating] = useState(false);

  const mutate = async ({ slotId, userId }) => {
    setIsMutating(true);
    try {
      // 1. VALIDACIÓN: Revisar si el usuario ya tiene un slot ocupado
      const { data: activeSlot } = await supabase
        .from('parking_slots')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (activeSlot) {
        alert("Ya tienes una reserva activa. Finaliza la anterior para continuar.");
        return;
      }

      // 2. ACTUALIZAR EL SLOT (Cambio de color a Rojo)
      const { error: slotError } = await supabase
        .from('parking_slots')
        .update({ 
          status: 'occupied', 
          user_id: userId 
        })
        .eq('id', slotId);

      if (slotError) throw slotError;

      // 3. GENERAR PARKING SESSION (Historial para tarifas)
      // Esta es la tabla que guarda el "quién y cuándo"
      const { error: sessionError } = await supabase
        .from('parking_sessions')
        .insert([{
          user_id: userId,
          slot_id: slotId,
          start_time: new Date().toISOString(),
          status: 'active'
        }]);

      if (sessionError) console.error("Error creando historial:", sessionError);

      alert("Parqueadero asignado correctamente");

    } catch (err) {
      console.error("Error en la operación:", err);
    } finally {
      setIsMutating(false);
    }
  };

  return { mutate, isMutating };
}

// 4. Hook para ver si el usuario ya tiene un puesto ocupado
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