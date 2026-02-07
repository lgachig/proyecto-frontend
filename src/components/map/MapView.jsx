import { useState, useCallback, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSlots, useReserveSlot, useActiveSession, useReleaseSlot } from '../../hooks/useParking';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { LogOut, Navigation, Loader2, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { MapContainer, TileLayer, Polyline, Marker, Circle, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

const GARITA_PRINCIPAL = { lat: -0.197880, lng: -78.502342 };
const CENTRO_UCE = [-0.1985, -78.5035];

function CoordTracker({ setHoverCoords, showPopup }) {
  useMapEvents({
    mousemove(e) {
      if (setHoverCoords) {
        setHoverCoords({ 
          lat: e.latlng.lat.toFixed(6), 
          lng: e.latlng.lng.toFixed(6), 
          x: e.containerPoint.x, 
          y: e.containerPoint.y 
        });
      }
    },
    click(e) {
      const coords = `${e.latlng.lat.toFixed(6)}, ${e.latlng.lng.toFixed(6)}`;
      navigator.clipboard.writeText(coords);
      showPopup(`Copiado: ${coords}`, "info");
    }
  });
  return null;
}

function MapController({ selectedSlot, flyToZone }) {
  const currentMap = useMap();
  useEffect(() => {
    if (!currentMap) return;
    if (flyToZone?.center_latitude != null && flyToZone?.center_longitude != null) {
      currentMap.flyTo([flyToZone.center_latitude, flyToZone.center_longitude], 18, { duration: 1.2 });
      return;
    }
    if (selectedSlot) {
      currentMap.flyTo([selectedSlot.latitude, selectedSlot.longitude], 20, { duration: 1.5 });
    }
  }, [selectedSlot, flyToZone, currentMap]);
  return null;
}

export default function MarkingMap({ flyToZone, setSuggestionDismissed }) {
  const queryClient = useQueryClient();
  const { user, profile, refetchProfile } = useAuth();
  
  const { data: initialSlots = [], isLoading: slotsLoading } = useSlots();
  const { mutate: reserve, isMutating } = useReserveSlot();
  const { release, isFinishing: isReleasing } = useReleaseSlot();
  const { data: activeSessionData, isLoading: sessionLoading } = useActiveSession(user?.id);

  const hasActiveReservation = !!activeSessionData;
  const myActiveSlotId = activeSessionData?.slot_id ?? activeSessionData?.parking_slots?.id ?? null;

  const [mounted, setMounted] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [routePoints, setRoutePoints] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [actionStatus, setActionStatus] = useState(null); 
  const [hoverCoords, setHoverCoords] = useState(null); 
  const [routeInfo, setRouteInfo] = useState({ duration: null, distance: null });

  const showPopup = (msg, type = "success") => {
    setActionStatus({ msg, type });
    setTimeout(() => setActionStatus(null), 4000);
  };

  useEffect(() => {
    if (!activeSessionData) {
      setSelectedSlot(null);
      setRoutePoints([]);
    }
  }, [activeSessionData]);

  useEffect(() => {
    const channel = supabase.channel('global-map-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'parking_slots' }, () => {
        queryClient.invalidateQueries({ queryKey: ['slots'] });
      })
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'parking_sessions' }, 
        async () => {
          await queryClient.invalidateQueries({ queryKey: ['activeSession', user?.id] });
          await queryClient.invalidateQueries({ queryKey: ['slots'] });
          if (refetchProfile) refetchProfile();
        })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [queryClient, refetchProfile, user?.id]);

  useEffect(() => {
    setMounted(true);
    const watchId = navigator.geolocation.watchPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => console.error("GPS Error:", err),
      { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const calculateETA = useCallback(async (uLat, uLng, sLat, sLng) => {
    try {
      const res = await fetch(`https://router.project-osrm.org/route/v1/foot/${uLng},${uLat};${sLng},${sLat}?overview=false`);
      const data = await res.json();
      if (data.routes?.[0]) {
        setRouteInfo({
          duration: Math.round(data.routes[0].duration / 60),
          distance: (data.routes[0].distance / 1000).toFixed(1)
        });
      }
    } catch (err) { console.error("Error ETA:", err); }
  }, []);

  const trazarRutas = useCallback((destino, origen) => {
    if (!origen || !destino) return;
    calculateETA(origen.lat, origen.lng, destino.latitude, destino.longitude);
    
    fetch(`https://router.project-osrm.org/route/v1/foot/${origen.lng},${origen.lat};${destino.longitude},${destino.latitude}?overview=full&geometries=geojson`)
      .then(res => res.json())
      .then(data => {
        if (data.routes?.[0]) setRoutePoints(data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]));
      });
  }, [calculateETA]);

  const handleReserve = async () => {
    const limit = profile?.role_id === 'r002' ? 5 : 3;
    if ((profile?.reservations_this_week || 0) >= limit) {
      showPopup(`Límite alcanzado (${limit}/semana)`, "error");
      return;
    }
    if (hasActiveReservation) {
      showPopup("Ya tienes una reserva activa.", "error");
      return;
    }
    try {
      await reserve({ slotId: selectedSlot.id, userId: user.id });
      // Actualiza el contador de reservas del perfil inmediatamente
      if (refetchProfile) await refetchProfile();
      showPopup("Reserva exitosa", "success");
    } catch { showPopup("Error al reservar", "error"); }
  };

  const handleReleaseSlot = async (slotId) => {
    try {
      // Usamos el hook release que inserta la notificación en la DB
      await release(slotId, user.id);
      
      // Refrescamos el perfil para que el contador de la UI sea exacto
      if (refetchProfile) await refetchProfile();
      
      setSelectedSlot(null);
      setRoutePoints([]);
    } catch (err) { 
      showPopup("Error al liberar", "error"); 
    }
  };

  if (!mounted || slotsLoading || (user?.id && sessionLoading)) {
    return <div className="h-full w-full flex items-center justify-center font-black text-[#003366]">CARGANDO MAPA...</div>;
  }

  return (
    <div className="h-full w-full relative">
      {actionStatus && (
        <div className="absolute top-10 left-1/2 -translate-x-1/2 z-[2000] w-[90%] max-w-sm animate-in fade-in zoom-in">
          <div className={`flex items-center gap-4 p-5 rounded-[2rem] shadow-2xl border-4 border-white ${
            actionStatus.type === 'success' ? 'bg-green-600' : actionStatus.type === 'error' ? 'bg-red-600' : 'bg-blue-600'
          } text-white`}>
            {actionStatus.type === 'info' ? <Clock size={24} /> : <CheckCircle2 size={30} />}
            <span className="font-black uppercase italic text-sm">{actionStatus.msg}</span>
          </div>
        </div>
      )}

      {hoverCoords && (
        <div className="pointer-events-none absolute z-[5000] bg-[#003366] text-white px-3 py-1.5 rounded-xl text-[10px] font-mono border-2 border-white shadow-2xl"
             style={{ left: hoverCoords.x + 15, top: hoverCoords.y + 15 }}>
          <span className="font-bold">{hoverCoords.lat}, {hoverCoords.lng}</span>
        </div>
      )}

      <MapContainer 
        center={CENTRO_UCE} 
        zoom={19} 
        maxZoom={22} 
        className="h-full w-full z-0 rounded-3xl md:rounded-[3rem]"
      >
        <TileLayer 
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
          maxNativeZoom={19}
          maxZoom={22}
        />
        <MapController selectedSlot={selectedSlot} flyToZone={flyToZone} />
        <CoordTracker setHoverCoords={setHoverCoords} showPopup={showPopup} />

        {userLocation && <Circle center={[userLocation.lat, userLocation.lng]} radius={3} pathOptions={{ color: 'white', fillColor: '#2563EB', fillOpacity: 1, weight: 3 }} />}

        {initialSlots.map((slot) => {
          const isMine = myActiveSlotId && String(slot.id) === String(myActiveSlotId);
          const isSelected = selectedSlot?.id === slot.id;
          const color = slot.status === 'available' ? '#22C55E' : (isMine ? '#2563EB' : '#EF4444');
          
          return (
            <Marker
              key={slot.id}
              position={[slot.latitude, slot.longitude]}
              eventHandlers={{ click: () => {
                if (hasActiveReservation && !isMine) {
                  showPopup("Ya tienes una reserva activa.", "error");
                  return;
                }
                setSuggestionDismissed?.(true);
                setSelectedSlot(slot);
                trazarRutas(slot, userLocation);
              }}}
              icon={L.divIcon({
                html: `<div style="background:${color}; width:30px; height:30px; border-radius:8px; border:3px solid white; display:flex; align-items:center; justify-content:center; color:white; font-weight:900; transition: 0.3s; transform: ${isSelected ? 'scale(1.3)' : 'scale(1)'}">${isSelected ? 'P' : ''}</div>`,
                className: ""
              })}
            />
          );
        })}

        {routePoints.length > 0 && <Polyline positions={routePoints} pathOptions={{ color: '#2563EB', weight: 6, opacity: 0.5 }} />}
      </MapContainer>

      {selectedSlot && (() => {
        const isMineNow = myActiveSlotId && String(selectedSlot.id) === String(myActiveSlotId);
        const limit = profile?.role_id === 'r002' ? 5 : 3;
        const reservasText = `${profile?.reservations_this_week ?? 0} / ${limit} semanales`;
        
        return (
          <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-[1000] w-[92%] max-w-md bg-white p-4 md:p-6 rounded-2xl md:rounded-[2.5rem] shadow-2xl border-t-4 border-[#003366]">
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center text-white font-black ${isMineNow ? 'bg-blue-600' : (selectedSlot.status === 'available' ? 'bg-[#003366]' : 'bg-[#CC0000]')}`}>
                <span className="text-[10px] opacity-70">Nº</span>
                <span className="text-2xl">{selectedSlot.number}</span>
              </div>
              <div>
                <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest leading-none mb-1">UCE Smart Parking</p>
                <h3 className="text-xl font-black text-[#003366] italic uppercase">
                  {isMineNow ? "Tu Reserva Activa" : "Espacio Parqueo"}
                </h3>
              </div>
            </div>

            {routeInfo.duration !== null && (
              <div className="flex items-center justify-between mb-5 px-5 py-4 bg-blue-50 rounded-2xl border-2 border-blue-100">
                <div className="flex items-center gap-3 text-[#003366]">
                  <Clock size={22} className="animate-pulse" />
                  <div>
                    <p className="text-[9px] font-bold uppercase opacity-60 leading-none">Tiempo</p>
                    <span className="text-2xl font-black italic">{routeInfo.duration} MIN</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-bold uppercase opacity-60 leading-none">Distancia</p>
                  <span className="text-sm font-black text-gray-500">{routeInfo.distance} KM</span>
                </div>
              </div>
            )}

            <div className="mb-4 flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-xl border border-amber-200">
              <AlertTriangle size={14} className="text-amber-600" />
              <p className="text-[10px] font-bold text-amber-800 uppercase">Reserva: {reservasText}</p>
            </div>

            <div className="flex flex-col gap-3">
              {isMineNow ? (
                <button 
                  onClick={() => handleReleaseSlot(selectedSlot.id)} 
                  disabled={isReleasing} 
                  className="w-full py-5 bg-[#CC0000] text-white rounded-2xl font-black uppercase tracking-widest shadow-lg flex items-center justify-center gap-3"
                >
                  {isReleasing ? <Loader2 className="animate-spin" /> : <><LogOut size={20}/> FINALIZAR SESIÓN</>}
                </button>
              ) : (
                <button
                  onClick={handleReserve}
                  disabled={selectedSlot.status !== 'available' || hasActiveReservation || isMutating}
                  className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest shadow-lg ${selectedSlot.status === 'available' && !hasActiveReservation ? 'bg-[#003366] text-white' : 'bg-gray-200 text-gray-400'}`}
                >
                  {isMutating ? <Loader2 className="animate-spin" /> : selectedSlot.status === 'available' ? <><Navigation size={20}/> RESERVAR</> : "OCUPADO"}
                </button>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}