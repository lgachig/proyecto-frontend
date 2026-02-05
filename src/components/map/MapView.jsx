import { useState, useCallback, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSlots, useReserveSlot, useActiveSession } from '../../hooks/useParking';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { LogOut, Navigation, Loader2, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { MapContainer, TileLayer, Polyline, Marker, Circle, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const GARITA_PRINCIPAL = { lat: -0.197880, lng: -78.502342 };
const CENTRO_UCE = [-0.1985, -78.5035];

function CoordTracker({ setHoverCoords, showPopup }) {
  useMapEvents({
    mousemove(e) {
      setHoverCoords({ 
        lat: e.latlng.lat.toFixed(6), 
        lng: e.latlng.lng.toFixed(6), 
        x: e.containerPoint.x, 
        y: e.containerPoint.y 
      });
    },
    click(e) {
      const coords = `${e.latlng.lat.toFixed(6)}, ${e.latlng.lng.toFixed(6)}`;
      navigator.clipboard.writeText(coords);
      showPopup(`Copiado: ${coords}`, "info");
    }
  });
  return null;
}

function MapController({ selectedSlot, userLocation, flyToZone }) {
  const currentMap = useMap();
  useEffect(() => {
    if (!currentMap) return;
    if (flyToZone?.center_latitude != null && flyToZone?.center_longitude != null) {
      currentMap.flyTo([flyToZone.center_latitude, flyToZone.center_longitude], 19, { duration: 1.2 });
      return;
    }
    if (selectedSlot) {
      currentMap.flyTo([selectedSlot.latitude, selectedSlot.longitude], 22, { duration: 1.5 });
    } else if (userLocation) {
      currentMap.flyTo([userLocation.lat, userLocation.lng], 19);
    }
  }, [selectedSlot, userLocation, flyToZone, currentMap]);
  return null;
}

export default function MarkingMap({ flyToZone, setSuggestionDismissed }) {
  const queryClient = useQueryClient();
  const { user, profile, refetchProfile } = useAuth();
  const { data: initialSlots, isLoading } = useSlots();
  const { mutate: reserve, isMutating } = useReserveSlot();
  
  const { data: activeSlotFromSession } = useActiveSession(user?.id);

  const hasActiveReservation = !!activeSlotFromSession;
  const myActiveSlotId = activeSlotFromSession?.id ?? null;

  const [slotsData, setSlotsData] = useState([]);
  const [mounted, setMounted] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [routePoints, setRoutePoints] = useState([]);
  const [cicloviaPoints, setCicloviaPoints] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [isFinishing, setIsFinishing] = useState(false);
  const [L, setL] = useState(null);
  const [actionStatus, setActionStatus] = useState(null); 
  const [hoverCoords, setHoverCoords] = useState(null); 
  const [routeInfo, setRouteInfo] = useState({ duration: null, distance: null });

  const showPopup = (msg, type = "success") => {
    setActionStatus({ msg, type });
    setTimeout(() => setActionStatus(null), 4000);
  };

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

  useEffect(() => {
    if (!hasActiveReservation) {
      setSelectedSlot(null);
      setRoutePoints([]);
      setRouteInfo({ duration: null, distance: null });
    }
  }, [hasActiveReservation]);

  useEffect(() => {
    setMounted(true);
    import("leaflet").then((leaflet) => setL(leaflet));
    const watchId = navigator.geolocation.watchPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => console.error("GPS Error:", err),
      { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  useEffect(() => { if (initialSlots) setSlotsData(initialSlots); }, [initialSlots]);

  const trazarRutas = useCallback((destino, origen) => {
    if (!origen || !destino) return;
    setCicloviaPoints([[GARITA_PRINCIPAL.lat, GARITA_PRINCIPAL.lng], [destino.latitude, destino.longitude]]);
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
      await refetchProfile?.();
      await queryClient.invalidateQueries({ queryKey: ['activeSession', user.id] });
      showPopup("Reserva realizada con éxito", "success");
    } catch {
      showPopup("Error al reservar", "error");
    }
  };

  const handleReleaseSlot = async (slotId) => {
    setIsFinishing(true);
    try {
      await supabase.from("parking_sessions").update({ end_time: new Date().toISOString(), status: 'completed' }).eq("user_id", user.id).eq("status", "active");
      await supabase.from("parking_slots").update({ status: 'available', user_id: null }).eq("id", slotId);
      await queryClient.invalidateQueries({ queryKey: ['activeSession', user.id] });
      await queryClient.invalidateQueries({ queryKey: ['slots'] });
      showPopup("Sesión finalizada", "info");
    } catch (err) { showPopup("Error al liberar", "error"); }
    finally { setIsFinishing(false); }
  };

  if (!mounted || isLoading || !L) return <div className="h-full w-full flex items-center justify-center font-black text-[#003366]">CARGANDO MAPA...</div>;

  return (
    <div className="h-[calc(100vh-200px)] w-full relative">
      
      {hoverCoords && (
        <div className="pointer-events-none absolute z-[5000] bg-[#003366] text-white px-3 py-1.5 rounded-xl text-[10px] font-mono border-2 border-white shadow-2xl"
             style={{ left: hoverCoords.x + 15, top: hoverCoords.y + 15 }}>
          <span className="font-bold">{hoverCoords.lat}, {hoverCoords.lng}</span>
        </div>
      )}
      
      {actionStatus && (
        <div className="absolute top-10 left-1/2 -translate-x-1/2 z-[2000] w-[90%] max-w-sm">
          <div className={`flex items-center gap-4 p-5 rounded-[2rem] shadow-2xl border-4 border-white ${
            actionStatus.type === 'success' ? 'bg-green-600' : actionStatus.type === 'error' ? 'bg-red-600' : 'bg-blue-600'
          } text-white`}>
            {actionStatus.type === 'info' ? <Clock size={24} /> : <CheckCircle2 size={30} />}
            <span className="font-black uppercase italic text-sm">{actionStatus.msg}</span>
          </div>
        </div>
      )}

      <MapContainer center={CENTRO_UCE} zoom={19} maxZoom={24} className="h-full w-full z-0">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" maxZoom={24} maxNativeZoom={19} />
        <MapController selectedSlot={selectedSlot} userLocation={userLocation} flyToZone={flyToZone} />
        <CoordTracker setHoverCoords={setHoverCoords} showPopup={showPopup} />

        {userLocation && <Circle center={[userLocation.lat, userLocation.lng]} radius={3} pathOptions={{ color: 'white', fillColor: '#2563EB', fillOpacity: 1, weight: 3 }} />}

        {slotsData?.map((slot) => {
          const isMine = slot.user_id === user?.id;
          const isSelected = selectedSlot?.id === slot.id;
          const color = slot.status === 'available' ? '#22C55E' : (isMine ? '#2563EB' : '#EF4444');
          
          const onSlotClick = () => {
            if (hasActiveReservation && slot.id !== myActiveSlotId) {
              showPopup("Ya tienes una reserva activa.", "error");
              return;
            }
            setSuggestionDismissed?.(true);
            setSelectedSlot(slot);
            trazarRutas(slot, userLocation);
          };

          return (
            <Marker
              key={slot.id}
              position={[slot.latitude, slot.longitude]}
              eventHandlers={{ click: onSlotClick }}
              icon={L.divIcon({
                html: `<div style="background:${color}; width:30px; height:30px; border-radius:8px; border:3px solid white; display:flex; align-items:center; justify-content:center; color:white; font-weight:900; transition: 0.3s; transform: ${isSelected ? 'scale(1.3)' : 'scale(1)'}">${isSelected ? 'P' : ''}</div>`,
                className: ""
              })}
            />
          );
        })}

        {routePoints.length > 0 && <Polyline positions={routePoints} pathOptions={{ color: '#2563EB', weight: 6, opacity: 0.5 }} />}
        {cicloviaPoints.length > 0 && <Polyline positions={cicloviaPoints} pathOptions={{ color: '#CC0000', weight: 3, dashArray: '8, 12', opacity: 0.7 }} />}
      </MapContainer>

      {selectedSlot && (() => {
        const displaySlot = slotsData.find((s) => s.id === selectedSlot.id) || selectedSlot;
        const isMineNow = displaySlot.user_id === user?.id;
        const limit = profile?.role_id === 'r002' ? 5 : 3;
        const reservasText = `${profile?.reservations_this_week ?? 0} / ${limit} semanales`;
        
        return (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] w-[92%] max-w-md bg-white p-6 rounded-[2.5rem] shadow-2xl border-t-4 border-[#003366]">
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center text-white font-black ${displaySlot.status === 'available' ? 'bg-[#003366]' : 'bg-[#CC0000]'}`}>
                <span className="text-[10px] opacity-70">Nº</span>
                <span className="text-2xl">{displaySlot.number}</span>
              </div>
              <div>
                <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest leading-none mb-1">UCE Smart Parking</p>
                <h3 className="text-xl font-black text-[#003366] italic uppercase">Espacio de Parqueo</h3>
              </div>
            </div>

            {routeInfo.duration !== null && (
              <div className="flex items-center justify-between mb-5 px-5 py-4 bg-blue-50 rounded-2xl border-2 border-blue-100">
                <div className="flex items-center gap-3 text-[#003366]">
                  <Clock size={22} className="animate-pulse" />
                  <div>
                    <p className="text-[9px] font-bold uppercase opacity-60 leading-none">Tiempo estimado</p>
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
                <button onClick={() => handleReleaseSlot(displaySlot.id)} className="w-full py-5 bg-[#CC0000] text-white rounded-2xl font-black uppercase tracking-widest shadow-lg flex items-center justify-center gap-3 active:scale-95 transition-transform">
                  {isFinishing ? <Loader2 className="animate-spin" /> : <><LogOut size={20}/> FINALIZAR SESIÓN</>}
                </button>
              ) : (
                <>
                  <button
                    onClick={handleReserve}
                    disabled={displaySlot.status !== 'available' || hasActiveReservation || isMutating}
                    className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest shadow-lg transition-all flex items-center justify-center gap-2 ${displaySlot.status === 'available' && !hasActiveReservation ? 'bg-[#003366] text-white active:scale-95' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                  >
                    {isMutating ? <Loader2 className="animate-spin" /> : displaySlot.status === 'available' ? <><Navigation size={20}/> RESERVAR PUESTO</> : "PUESTO OCUPADO"}
                  </button>
                </>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}