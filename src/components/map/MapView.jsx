"use client";
import { useState, useCallback, useEffect } from "react";
import { useSlots, useReserveSlot } from "../../hooks/useParking";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../lib/supabase";
import { LogOut, Navigation, Loader2, MapPin } from "lucide-react";

import dynamic from 'next/dynamic';

const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false });
const Polyline = dynamic(() => import('react-leaflet').then(m => m.Polyline), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(m => m.Marker), { ssr: false });

import "leaflet/dist/leaflet.css";

const GARITA_PRINCIPAL = { lat: -0.197880, lng: -78.502342 };
const ENTRADA_AMERICA = { lat: -0.195500, lng: -78.504500 };
const CENTRO_UCE = [-0.1985, -78.5035];

function MapController({ selectedSlot, userLocation }) {
  const LMap = require('react-leaflet').useMap;
  const currentMap = LMap();

  useEffect(() => {
    if (currentMap) {
      if (selectedSlot) {
        // ZOOM MÁS CERCANO (Nivel 20)
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
  const { data: slotsData, isLoading } = useSlots();
  const { mutate: reserve } = useReserveSlot();

  const [mounted, setMounted] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [routePoints, setRoutePoints] = useState([]);
  const [cicloviaPoints, setCicloviaPoints] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [isFinishing, setIsFinishing] = useState(false);
  const [L, setL] = useState(null);

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
  }, []);

  // SOLUCIÓN AL ERROR REFETCH: Usamos window.location.reload o una actualización de estado manual
  const handleReleaseSlot = async (slotId) => {
    if (!confirm("¿Deseas finalizar tu sesión de parqueo?")) return;
    setIsFinishing(true);
    try {
      await supabase.from("parking_sessions").update({ end_time: new Date().toISOString(), status: 'completed' }).eq("user_id", user.id).eq("status", "active");
      await supabase.from("parking_slots").update({ status: 'available', user_id: null }).eq("id", slotId);
      
      // En lugar de refetch(), recargamos para asegurar limpieza total
      window.location.reload(); 
    } catch (err) { 
      console.error(err); 
    } finally { 
      setIsFinishing(false); 
    }
  };

  const trazarRutas = useCallback((destino, origen) => {
    if (!origen || !destino) return;

    // LÍNEA DE CICLOVÍA (Guía visual directa desde la entrada de la facultad)
    setCicloviaPoints([
      [GARITA_PRINCIPAL.lat, GARITA_PRINCIPAL.lng],
      [destino.latitude, destino.longitude]
    ]);

    fetch(`https://router.project-osrm.org/route/v1/foot/${origen.lng},${origen.lat};${destino.longitude},${destino.latitude}?overview=full&geometries=geojson`)
      .then(res => res.json())
      .then(data => {
        if (data.routes?.[0]) {
          setRoutePoints(data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]));
        }
      });
  }, []);

  useEffect(() => {
    if (mounted && slotsData && user && !selectedSlot) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(loc);
          const miReserva = slotsData.find(s => s.user_id === user.id);
          if (miReserva) { 
            setSelectedSlot(miReserva); 
            trazarRutas(miReserva, loc); 
          }
        },
        () => setUserLocation(ENTRADA_AMERICA),
        { timeout: 5000 }
      );
    }
  }, [mounted, slotsData, user, trazarRutas]);

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

        {slotsData?.map((slot) => {
          const isMine = slot.user_id === user?.id;
          const isSelected = selectedSlot?.id === slot.id;
          // Colores según tabla: Verde (Disponible), Azul (Mío), Rojo (Ocupado)
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

        {/* RUTA CAMINANDO */}
        {routePoints.length > 0 && <Polyline positions={routePoints} pathOptions={{ color: '#2563EB', weight: 6, opacity: 0.5 }} />}
        
        {/* LÍNEA CICLOVÍA (Guía Técnica Roja) */}
        {cicloviaPoints.length > 0 && <Polyline positions={cicloviaPoints} pathOptions={{ color: '#CC0000', weight: 3, dashArray: '10, 15', opacity: 0.8 }} />}
      </MapContainer>

      {/* PANEL DE INFORMACIÓN - POSICIONADO MÁS ARRIBA */}
      {selectedSlot && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-[1000] w-[92%] max-w-md bg-white p-6 rounded-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] border-t-4 border-[#003366]">
          <div className="flex items-center gap-4 mb-5">
            <div className={`w-16 h-16 rounded-[1.5rem] flex flex-col items-center justify-center text-white font-black ${selectedSlot.user_id === user?.id ? 'bg-[#CC0000]' : 'bg-[#003366]'}`}>
              <span className="text-[10px] uppercase opacity-70 leading-none mb-1">Puesto</span>
              <span className="text-2xl leading-none">{selectedSlot.number}</span>
            </div>
            <div>
              <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-1">Estado: {selectedSlot.status}</p>
              <h3 className="text-2xl font-black text-[#003366] italic uppercase">Ubicación UCE</h3>
            </div>
          </div>
          
          <div className="flex gap-3">
            {selectedSlot.user_id === user?.id ? (
              <button
                onClick={() => handleReleaseSlot(selectedSlot.id)}
                disabled={isFinishing}
                className="w-full py-5 bg-[#CC0000] text-white rounded-2xl font-black uppercase tracking-widest shadow-lg flex items-center justify-center gap-3 active:scale-95 transition-all"
              >
                {isFinishing ? <Loader2 className="animate-spin" /> : <><LogOut size={22}/> LIBERAR AHORA</>}
              </button>
            ) : (
              <button
                onClick={() => reserve({ slotId: selectedSlot.id, userId: user.id })}
                disabled={selectedSlot.status !== 'available'}
                className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest shadow-lg transition-all flex items-center justify-center gap-2 ${
                  selectedSlot.status === 'available' ? 'bg-[#003366] text-white active:scale-95' : 'bg-gray-200 text-gray-400'
                }`}
              >
                {selectedSlot.status === 'available' ? <><Navigation size={20}/> RESERVAR PUESTO</> : "OCUPADO"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}