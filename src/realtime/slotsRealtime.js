import { supabase } from '../lib/supabase';
import { useParkingStore } from '../store/parkingStore';

export const initSlotsRealtime = () => {
  const updateSlot = useParkingStore.getState().updateSlot;
  const addSlot = useParkingStore.getState().addSlot;
  const removeSlot = useParkingStore.getState().removeSlot;

  const channel = supabase
    .channel('parking-realtime')

    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'parking_slots' },
      (payload) => {
        if (payload.eventType === 'UPDATE') updateSlot(payload.new);
        if (payload.eventType === 'INSERT') addSlot(payload.new);
        if (payload.eventType === 'DELETE') removeSlot(payload.old.id);
      }
    )

    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'parking_sessions' },
      () => {
        useParkingStore.getState().touch();
      }
    )

    .subscribe();

  return () => supabase.removeChannel(channel);
};