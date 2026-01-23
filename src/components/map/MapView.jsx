"use client";
import { useState, useCallback, useEffect } from "react";
import { useSlots, useReserveSlot } from "../../hooks/useParking";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../lib/supabase";
import { LogOut, Navigation, Loader2, Clock, MapPin } from "lucide-react";

import dynamic from 'next/dynamic';

const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false });
const Polyline = dynamic(() => import('react-leaflet').then(m => m.Polyline), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(m => m.Marker), { ssr: false });
const Circle = dynamic(() => import('react-leaflet').then(m => m.Circle), { ssr: false }); 

import "leaflet/dist/leaflet.css";

const GARITA_PRINCIPAL = { lat: -0.197880, lng: -78.502342 };
const CENTRO_UCE = [-0.1985, -78.5035];

function MapController({ selectedSlot, userLocation }) {
  const LMap = require('react-leaflet').useMap;
  const currentMap = LMap();

  useEffect(() => {
    if (currentMap) {
      if (selectedSlot) {
        currentMap.flyTo([selectedSlot.latitude, selectedSlot.longitude], 20, { duration: 1.5 });
      } else if (userLocation) {
        currentMap.flyTo([userLocation.lat, userLocation.lng], 18);
      }
    }
  }, [selectedSlot, userLocation, currentMap]);
  return null;
}

export default function MarkingMap() {
  const { user } = useAuth();
  const { data: initialSlots, isLoading } = useSlots();
  const { mutate: reserve } = useReserveSlot();

  const [slotsData, setSlotsData] = useState([]);
  const [mounted, setMounted] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [routePoints, setRoutePoints] = useState([]);
  const [cicloviaPoints, setCicloviaPoints] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [isFinishing, setIsFinishing] = useState(false);
  const [L, setL] = useState(null);
  const [activeAlert, setActiveAlert] = useState(null);
  const [routeInfo, setRouteInfo] = useState({ duration: null, distance: null });

  // Lógica de Alertas de Ocupación
  const checkRealtimeAlerts = useCallback((currentSlots) => {
    if (!currentSlots || currentSlots.length === 0) return;
    const total = currentSlots.length;
    const occupied = currentSlots.filter(s => s.status === 'occupied').length;
    const porcentaje = Math.round((occupied / total) * 100);

    if (porcentaje >= 100) {
      setActiveAlert({ msg: "🔴 PARQUEADERO LLENO", type: "danger" });
    } else if (porcentaje >= 80) {
      setActiveAlert({ msg: `⚠️ ALTA DEMANDA: ${porcentaje}%`, type: "warning" });
    } else {
      setActiveAlert(null);
    }
  }, []);

  // Lógica para calcular tiempo estimado (ETA)
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

  // Sincronización Inicial
  useEffect(() => {
    if (initialSlots) {
      setSlotsData(initialSlots);
      checkRealtimeAlerts(initialSlots);
    }
  }, [initialSlots, checkRealtimeAlerts]);

  // WebSocket Realtime (Corregido para evitar error de refetch)
  useEffect(() => {
    const channel = supabase
      .channel('map-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'parking_slots' }, async () => {
        const { data } = await supabase.from("parking_slots").select("*").order('number', { ascending: true });
        if (data) {
          setSlotsData(data);
          checkRealtimeAlerts(data);
        }
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [checkRealtimeAlerts]);

  // GPS y Leaflet Init
  useEffect(() => {
    setMounted(true);
    import("leaflet").then((leaflet) => {
      setL(leaflet);
      delete leaflet.Icon.Default.prototype._getIconUrl;
      leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });
    });

    const watchId = navigator.geolocation.watchPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => console.error("Error GPS:", err),
      { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

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

  const handleReleaseSlot = async (slotId) => {
    if (!confirm("¿Deseas finalizar tu sesión de parqueo?")) return;
    setIsFinishing(true);
    try {
      await supabase.from("parking_sessions").update({ end_time: new Date().toISOString(), status: 'completed' }).eq("user_id", user.id).eq("status", "active");
      await supabase.from("parking_slots").update({ status: 'available', user_id: null }).eq("id", slotId);
      window.location.reload(); 
    } catch (err) { console.error(err); } finally { setIsFinishing(false); }
  };

  if (!mounted || isLoading || !L) return (
    <div className="h-screen w-full flex items-center justify-center font-black text-[#003366] bg-white">
      <Loader2 className="animate-spin mr-3" /> CARGANDO MAPA...
    </div>
  );

  return (
    <div className="h-screen w-full relative">
      <MapContainer center={CENTRO_UCE} zoom={18} className="h-full w-full z-0" maxZoom={20}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" maxZoom={20} />
        <MapController selectedSlot={selectedSlot} userLocation={userLocation} />

        {userLocation && (
          <>
            <Circle center={[userLocation.lat, userLocation.lng]} radius={12} pathOptions={{ fillColor: '#3b82f6', fillOpacity: 0.2, color: 'transparent' }} />
            <Circle center={[userLocation.lat, userLocation.lng]} radius={4} pathOptions={{ fillColor: '#2563EB', fillOpacity: 1, color: 'white', weight: 3 }} />
          </>
        )}

        {slotsData?.map((slot) => {
          const isMine = slot.user_id === user?.id;
          const isSelected = selectedSlot?.id === slot.id;
          const color = slot.status === 'available' ? '#22C55E' : (isMine ? '#2563EB' : '#EF4444');
          return (
            <Marker
              key={slot.id}
              position={[slot.latitude, slot.longitude]}
              eventHandlers={{ click: () => { setSelectedSlot(slot); trazarRutas(slot, userLocation); } }}
              icon={L.divIcon({
                html: `<div style="background:${color}; width:30px; height:30px; border-radius:8px; border:3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); transform: ${isSelected ? 'scale(1.4)' : 'scale(1)'}; transition: all 0.3s; display:flex; align-items:center; justify-content:center; color:white; font-size:12px; font-weight:900;">${isSelected ? 'P' : ''}</div>`,
                className: ""
              })}
            />
          );
        })}

        {routePoints.length > 0 && <Polyline positions={routePoints} pathOptions={{ color: '#2563EB', weight: 6, opacity: 0.5 }} />}
        {cicloviaPoints.length > 0 && <Polyline positions={cicloviaPoints} pathOptions={{ color: '#CC0000', weight: 3, dashArray: '10, 15', opacity: 0.8 }} />}
      </MapContainer>

      {/* NOTIFICACIÓN DE ESTADO */}
      {activeAlert && (
        <div className="absolute top-28 left-1/2 -translate-x-1/2 z-[1001] w-[90%] max-w-sm">
          <div className={`${activeAlert.type === 'danger' ? 'bg-red-600' : 'bg-orange-500'} text-white px-6 py-4 rounded-[2rem] shadow-2xl flex items-center justify-center gap-3 border-2 border-white animate-bounce`}>
            <span className="font-black uppercase italic text-sm tracking-tight text-center">{activeAlert.msg}</span>
          </div>
        </div>
      )}

      {selectedSlot && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-[1000] w-[92%] max-w-md bg-white p-6 rounded-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] border-t-4 border-[#003366]">
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-16 h-16 rounded-[1.5rem] flex flex-col items-center justify-center text-white font-black ${selectedSlot.user_id === user?.id ? 'bg-[#CC0000]' : 'bg-[#003366]'}`}>
              <span className="text-[10px] uppercase opacity-70 leading-none mb-1">Puesto</span>
              <span className="text-2xl leading-none">{selectedSlot.number}</span>
            </div>
            <div>
              <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-1">Estado: {selectedSlot.status}</p>
              <h3 className="text-2xl font-black text-[#003366] italic uppercase leading-none">Ubicación UCE</h3>
            </div>
          </div>

          {/* TIEMPO ESTIMADO (ETA) */}
          {routeInfo.duration && (
            <div className="flex items-center justify-between mb-5 px-4 py-3 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-2 text-[#003366]">
                <Clock size={18} className="animate-pulse" />
                <span className="text-xl font-black italic">{routeInfo.duration} <span className="text-[10px]">MIN</span></span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <MapPin size={16} />
                <span className="text-sm font-bold">{routeInfo.distance} KM</span>
              </div>
            </div>
          )}
          
          <div className="flex gap-3">
            {selectedSlot.user_id === user?.id ? (
              <button onClick={() => handleReleaseSlot(selectedSlot.id)} disabled={isFinishing} className="w-full py-5 bg-[#CC0000] text-white rounded-2xl font-black uppercase tracking-widest shadow-lg flex items-center justify-center gap-3 active:scale-95 transition-all">
                {isFinishing ? <Loader2 className="animate-spin" /> : <><LogOut size={22}/> LIBERAR AHORA</>}
              </button>
            ) : (
              <button onClick={() => reserve({ slotId: selectedSlot.id, userId: user.id })} disabled={selectedSlot.status !== 'available'} className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest shadow-lg transition-all flex items-center justify-center gap-2 ${selectedSlot.status === 'available' ? 'bg-[#003366] text-white active:scale-95' : 'bg-gray-200 text-gray-400'}`}>
                {selectedSlot.status === 'available' ? <><Navigation size={20}/> RESERVAR PUESTO</> : "OCUPADO"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}