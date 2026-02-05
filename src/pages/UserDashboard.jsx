import { lazy, Suspense, useState, useEffect, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useZones, useSlots, useReservationHistory, useReserveSlot, useActiveSession } from '../hooks/useParking';
import { MapPin, X, Loader2 } from 'lucide-react';

const MarkingMap = lazy(() => import('../components/map/MapView'));

export default function UserDashboard() {
  const queryClient = useQueryClient();
  const { user, profile, refetchProfile } = useAuth();
  
  const { data: activeSession, isLoading: sessionLoading } = useActiveSession(user?.id);
  const { data: zones = [], isLoading: zonesLoading } = useZones();
  const { data: slots = [] } = useSlots();
  const { data: sessions = [] } = useReservationHistory(user?.id);
  const { mutate: reserve, isMutating: isReserving } = useReserveSlot();

  const [flyToZone, setFlyToZone] = useState(null);
  const [zonesMenuOpen, setZonesMenuOpen] = useState(false);
  const [smartSuggestion, setSmartSuggestion] = useState(null);
  const [suggestionDismissed, setSuggestionDismissed] = useState(false);

  const credits = useMemo(() => {
    const limit = profile?.role_id === 'r002' ? 5 : 3;
    return Math.max(0, limit - (profile?.reservations_this_week || 0));
  }, [profile]);

  const usualSlotNumber = useMemo(() => {
    if (!sessions || sessions.length === 0) return null;
    const counts = sessions.reduce((acc, s) => {
      const num = s.parking_slots?.number;
      if (num) acc[num] = (acc[num] || 0) + 1;
      return acc;
    }, {});
    const entries = Object.entries(counts);
    return entries.length === 0 ? null : entries.reduce((a, b) => (counts[a[0]] >= counts[b[0]] ? a : b))[0];
  }, [sessions]);

  const usualSlot = useMemo(
    () => (usualSlotNumber ? slots.find((s) => String(s.number) === String(usualSlotNumber)) : null),
    [slots, usualSlotNumber]
  );

  useEffect(() => {
    if (suggestionDismissed || credits === 0 || activeSession) {
      setSmartSuggestion(null);
    } else if (usualSlot && usualSlot.status === 'available') {
      setSmartSuggestion({ type: 'usual', slot: usualSlot });
    }

    if (user?.id) {
      const channel = supabase
        .channel(`global-user-sync-${user.id}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'parking_sessions', filter: `user_id=eq.${user.id}` },
          async (payload) => {
            if (payload.new?.status === 'completed' || payload.eventType === 'DELETE') {
              await queryClient.invalidateQueries({ queryKey: ['activeSession', user.id] });
              await queryClient.invalidateQueries({ queryKey: ['slots'] });
              await queryClient.invalidateQueries({ queryKey: ['reservationHistory', user.id] });
              if (refetchProfile) refetchProfile();
            }
          }
        )
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    }
  }, [credits, usualSlot, suggestionDismissed, activeSession, user?.id, queryClient, refetchProfile]);

  const handleAcceptUsualSpot = async () => {
    const slot = smartSuggestion?.slot;
    if (!slot || !user?.id) return;
    try {
      await reserve({ slotId: slot.id, userId: user.id });
      if (refetchProfile) await refetchProfile();
      queryClient.invalidateQueries({ queryKey: ['activeSession', user.id] });
      queryClient.invalidateQueries({ queryKey: ['slots'] });
      setFlyToZone({ center_latitude: slot.latitude, center_longitude: slot.longitude });
      setSuggestionDismissed(true);
    } catch (err) { console.error(err); }
  };

  const handleGoToZone = (zone) => {
    setFlyToZone(zone);
    setZonesMenuOpen(false);
  };

  return (
    <div className="h-full w-full relative">
      <div className="h-full w-full rounded-[3rem] overflow-hidden border-4 border-white shadow-2xl relative">
        <Suspense fallback={<div className="h-full w-full flex items-center justify-center font-black animate-pulse bg-slate-100">GPS UCE...</div>}>
          <MarkingMap 
            flyToZone={flyToZone} 
            setSuggestionDismissed={setSuggestionDismissed} 
          />
        </Suspense>
      </div>
      
      <div className="absolute top-6 right-6 z-[500] flex flex-col items-end gap-2">
        <button onClick={() => setZonesMenuOpen((o) => !o)} className="bg-white/95 px-4 py-3 rounded-xl shadow-lg border-l-4 border-[#003366] flex items-center gap-2 font-black text-[#003366] uppercase text-sm">
          <MapPin size={18} /> Zonas
        </button>
        {zonesMenuOpen && (
          <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 overflow-hidden min-w-[200px] max-h-[280px] overflow-y-auto">
            {zones.map((zone) => (
              <button key={zone.id} onClick={() => handleGoToZone(zone)} className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-50 last:border-0 font-bold text-[#003366] text-sm flex items-center gap-2">
                <MapPin size={14} className="text-[#CC0000]" /> {zone.name || zone.id}
              </button>
            ))}
          </div>
        )}
      </div>

      {smartSuggestion && !suggestionDismissed && !activeSession && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-[1100] w-[92%] max-w-md bg-white p-5 rounded-[2rem] shadow-2xl border-t-4 border-[#003366] flex flex-col gap-3">
          <div className="flex justify-between items-start">
            <p className="font-black text-[#003366] uppercase text-sm">¿Tu puesto de siempre?</p>
            <button onClick={() => setSuggestionDismissed(true)} className="p-1"><X size={20} /></button>
          </div>
          <p className="text-gray-600 font-bold text-sm">Puesto #{smartSuggestion.slot?.number} libre. Reserva ahora.</p>
          <button onClick={handleAcceptUsualSpot} disabled={isReserving} className="py-3 bg-[#003366] text-white rounded-xl font-black uppercase text-xs">
            {isReserving ? <Loader2 size={16} className="animate-spin" /> : "Sí, reservar"}
          </button>
        </div>
      )}
    </div>
  );
}