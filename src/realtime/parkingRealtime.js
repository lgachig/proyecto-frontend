import { supabase } from '../lib/supabase';
import { queryClient } from '../lib/queryClient';

let channel;

export function initParkingRealtime() {
  if (channel) return;

  channel = supabase
    .channel('parking-realtime')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'parking_slots' },
      () => {
        queryClient.invalidateQueries({ queryKey: ['slots'] });
      }
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'parking_sessions' },
      () => {
        queryClient.invalidateQueries({ queryKey: ['activeSession'], exact: false });
        queryClient.invalidateQueries({ queryKey: ['reservations'], exact: false });
      }
    )
    .subscribe();
}