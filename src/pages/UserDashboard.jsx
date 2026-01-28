import { lazy, Suspense, useState, useEffect, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useZones, useSlots, useReservationHistory } from '../hooks/useParking';
import { MapPin, X, Navigation } from 'lucide-react';

const MarkingMap = lazy(() => import('../components/map/MapView'));

export default function UserDashboard() {
  const { user, profile } = useAuth();
  const { data: zones = [], isLoading: zonesLoading } = useZones();
  const { data: slots = [] } = useSlots();
  const { data: sessions = [] } = useReservationHistory(user?.id);

  const [flyToZone, setFlyToZone] = useState(null);
  const [zonesMenuOpen, setZonesMenuOpen] = useState(false);
  const [smartSuggestion, setSmartSuggestion] = useState(null);
  const [suggestionDismissed, setSuggestionDismissed] = useState(false);

  const credits = useMemo(() => {
    const limit = profile?.role_id === 'r002' ? 5 : 3;
    return Math.max(0, limit - (profile?.reservations_this_week || 0));
  }, [profile]);

  const usualSlotNumber = useMemo(() => {
    if (sessions.length === 0) return null;
    const counts = sessions.reduce((acc, s) => {
      const num = s.parking_slots?.number;
      if (num) acc[num] = (acc[num] || 0) + 1;
      return acc;
    }, {});
    const entries = Object.entries(counts);
    if (entries.length === 0) return null;
    return entries.reduce((a, b) => (counts[a[0]] >= counts[b[0]] ? a : b))[0];
  }, [sessions]);

  const usualSlot = useMemo(
    () => (usualSlotNumber ? slots.find((s) => String(s.number) === String(usualSlotNumber)) : null),
    [slots, usualSlotNumber]
  );

  const nearestAvailable = useMemo(() => {
    const available = slots.filter((s) => s.status === 'available');
    if (available.length === 0) return null;
    return available[0];
  }, [slots]);

  useEffect(() => {
    if (suggestionDismissed || credits === 0) {
      setSmartSuggestion(null);
      return;
    }
    if (usualSlot && usualSlot.status === 'available') {
      setSmartSuggestion({ type: 'usual', slot: usualSlot });
      return;
    }
    if (nearestAvailable) {
      setSmartSuggestion({ type: 'nearest', slot: nearestAvailable });
    } else {
      setSmartSuggestion(null);
    }
  }, [credits, usualSlot, nearestAvailable, suggestionDismissed]);

  const handleGoToZone = (zone) => {
    setFlyToZone(zone);
    setZonesMenuOpen(false);
  };

  return (
    <div className="h-full w-full relative">
      <div className="h-full w-full rounded-[3rem] overflow-hidden border-4 border-white shadow-2xl relative">
        <Suspense
          fallback={
            <div className="h-full w-full flex items-center justify-center font-black animate-pulse bg-slate-100 rounded-[3rem]">
              SINCRONIZANDO GPS UCE...
            </div>
          }
        >
          <MarkingMap flyToZone={flyToZone} />
        </Suspense>
      </div>

      <div className="absolute top-6 left-6 z-[500] bg-white/90 px-4 py-2 rounded-xl shadow-lg border-l-4 border-[#003366]">
        <p className="text-[10px] font-black text-gray-400 uppercase leading-tight">Navegación</p>
        <p className="text-xs font-black text-[#003366] uppercase italic">GPS Activo</p>
      </div>

      {/* Floating zone menu */}
      <div className="absolute top-6 right-6 z-[500] flex flex-col items-end gap-2">
        <button
          onClick={() => setZonesMenuOpen((o) => !o)}
          className="bg-white/95 hover:bg-white px-4 py-3 rounded-xl shadow-lg border-l-4 border-[#003366] flex items-center gap-2 font-black text-[#003366] uppercase text-sm"
        >
          <MapPin size={18} /> Zonas
        </button>
        {zonesMenuOpen && (
          <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 overflow-hidden min-w-[200px] max-h-[280px] overflow-y-auto">
            {zonesLoading ? (
              <p className="p-4 text-gray-400 font-bold text-sm">Cargando...</p>
            ) : (
              zones.map((zone) => (
                <button
                  key={zone.id}
                  onClick={() => handleGoToZone(zone)}
                  className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-50 last:border-0 font-bold text-[#003366] text-sm flex items-center gap-2"
                >
                  <MapPin size={14} className="text-[#CC0000]" />
                  {zone.name || zone.code || zone.id}
                </button>
              ))
            )}
            {!zonesLoading && zones.length === 0 && (
              <p className="p-4 text-gray-400 font-bold text-sm">Sin zonas</p>
            )}
          </div>
        )}
      </div>

      {/* Smart parking suggestion */}
      {smartSuggestion && !suggestionDismissed && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-[1100] w-[92%] max-w-md bg-white p-5 rounded-[2rem] shadow-2xl border-t-4 border-[#003366] flex flex-col gap-3">
          <div className="flex justify-between items-start">
            <p className="font-black text-[#003366] uppercase text-sm">
              {smartSuggestion.type === 'usual'
                ? '¿Quieres parquearte en tu puesto habitual?'
                : 'Puesto cercano disponible'}
            </p>
            <button onClick={() => setSuggestionDismissed(true)} className="p-1 hover:bg-gray-100 rounded-full">
              <X size={20} className="text-gray-500" />
            </button>
          </div>
          <p className="text-gray-600 font-bold text-sm">
            {smartSuggestion.type === 'usual'
              ? `Puesto #${smartSuggestion.slot?.number} está libre.`
              : `Puesto #${smartSuggestion.slot?.number} es el más cercano disponible.`}
          </p>
          <button
            onClick={() => {
              const s = smartSuggestion.slot;
              if (s?.latitude != null && s?.longitude != null) {
                setFlyToZone({ center_latitude: s.latitude, center_longitude: s.longitude });
              }
              setSuggestionDismissed(true);
            }}
            className="flex items-center justify-center gap-2 py-3 bg-[#003366] text-white rounded-xl font-black uppercase text-xs"
          >
            <Navigation size={16} /> Ver en mapa
          </button>
        </div>
      )}
    </div>
  );
}
