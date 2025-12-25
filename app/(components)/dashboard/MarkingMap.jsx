"use client";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import { useEffect, useState, useCallback, useMemo } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

function MapController({ routePoints }) {
  const map = useMap();
  useEffect(() => {
    map.setMinZoom(16);
    map.setMaxZoom(24);
    if (routePoints && routePoints.length > 0) {
      const bounds = L.latLngBounds(routePoints);
      map.flyToBounds(bounds, { padding: [40, 40], duration: 1.5 });
    }
  }, [routePoints, map]);
  return null;
}

export default function MarkingMap({ isUserInside }) {
  const [mounted, setMounted] = useState(false);
  const [posicionActual, setPosicionActual] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [routePoints, setRoutePoints] = useState([]);

  useEffect(() => { 
    setMounted(true); 
    if (!isUserInside) {
      setPosicionActual(null);
      setRoutePoints([]);
      setSelectedSlot(null);
    }
  }, [isUserInside]);

  const esquinas = [
    { lat: -0.19927876667770106, lng: -78.5028195104557 },
    { lat: -0.1992130529554521, lng: -78.50293752764652 },
    { lat: -0.19884693364097933, lng: -78.5027216098315 },
    { lat: -0.198909965171899, lng: -78.5026042631929 }
  ];

  const slots = useMemo(() => {
    const s = [];
    const crearLinea = (p1, p2, prefix, count) => {
      for (let i = 0; i < count; i++) {
        const ratio = i / count;
        s.push({ 
          id: `${prefix}-${i + 1}`, 
          lat: p1.lat + (p2.lat - p1.lat) * ratio, 
          lng: p1.lng + (p2.lng - p1.lng) * ratio 
        });
      }
    };
    crearLinea(esquinas[0], esquinas[1], "INF", 6);
    crearLinea(esquinas[1], esquinas[2], "DER", 12);
    crearLinea(esquinas[2], esquinas[3], "SUP", 6);
    crearLinea(esquinas[3], esquinas[0], "IZQ", 12);
    return s;
  }, []);

  const obtenerRuta = useCallback((slot) => {
    const inicio = posicionActual || [-0.1983, -78.5008];
    const entradaParqueo = [esquinas[3].lat, esquinas[3].lng];
    const url = `https://router.project-osrm.org/route/v1/foot/${inicio[1]},${inicio[0]};${entradaParqueo[1]},${entradaParqueo[0]}?overview=full&geometries=geojson`;
    
    fetch(url).then(res => res.json()).then(data => {
      if (data.routes?.[0]) {
        const coords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
        setRoutePoints([...coords, [slot.lat, slot.lng]]);
      }
    });
  }, [posicionActual, esquinas]);

  if (!mounted) return null;

  return (
    <div className="w-full h-full relative overflow-hidden rounded-[inherit]">
      {/* BLOQUEO: Ahora usa z-[500] para no sobrepasar el Dashboard */}
      {!isUserInside && (
        <div className="absolute inset-0 z-[500] bg-white/60 backdrop-blur-md flex items-center justify-center pointer-events-auto">
          <div className="bg-white p-8 rounded-[2rem] shadow-2xl text-center border-b-4 border-orange-400">
             <h4 className="text-xl font-black uppercase italic text-gray-800 tracking-tighter">MAPA BLOQUEADO</h4>
             <p className="text-gray-500 font-bold text-sm mt-2">ESCANEÉ EL CÓDIGO QR</p>
          </div>
        </div>
      )}

      {/* MENSAJE DE DESTINO */}
      {selectedSlot && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[450] bg-white px-6 py-3 rounded-2xl shadow-2xl border-2 border-blue-500 flex items-center gap-3">
           <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-black">P</div>
           <span className="text-lg font-black text-gray-800 uppercase italic leading-none">{selectedSlot.id}</span>
           <button onClick={(e) => { e.stopPropagation(); setSelectedSlot(null); setRoutePoints([]); }} className="ml-2 text-gray-400 hover:text-red-500">✕</button>
        </div>
      )}

      {isUserInside && !posicionActual && (
        <div className="absolute inset-0 z-[400] bg-white/10 backdrop-blur-sm flex items-center justify-center">
          <button 
            onClick={() => setPosicionActual([-0.1983, -78.5008])} 
            className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg uppercase italic transition-transform active:scale-95"
          >
            Activar Navegación GPS
          </button>
        </div>
      )}

      <MapContainer 
        center={[-0.199050, -78.502750]} 
        zoom={19} 
        className="w-full h-full z-0"
        tap={false}
      >
        <TileLayer 
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={24}
            maxNativeZoom={19} 
        />
        
        <MapController routePoints={routePoints} />
        
        {slots.map((slot) => (
          <Marker 
            key={slot.id} 
            position={[slot.lat, slot.lng]}
            interactive={true}
            bubblingMouseEvents={false}
            eventHandlers={{ 
              mousedown: (e) => { 
                L.DomEvent.stopPropagation(e);
                if(isUserInside) { 
                  setSelectedSlot(slot); 
                  obtenerRuta(slot); 
                } 
              } 
            }}
            icon={L.divIcon({ 
              html: `<div style="background-color: ${selectedSlot?.id === slot.id ? '#FACC15' : '#4ADE80'}; width: 22px; height: 26px; border: 2px solid white; border-radius: 4px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"></div>`, 
              className: "marker-pin",
              iconSize: [22, 26],
              iconAnchor: [11, 13]
            })}
          />
        ))}

        {posicionActual && (
          <Marker position={posicionActual} icon={L.divIcon({ 
            html: `<div style="background-color: #3B82F6; width: 22px; height: 22px; border-radius: 50%; border: 4px solid white;"></div>` 
          })} />
        )}

        {routePoints.length > 0 && (
          <Polyline positions={routePoints} pathOptions={{ color: "#3B82F6", weight: 7, dashArray: "1, 15", lineCap: "round" }} />
        )}
      </MapContainer>
    </div>
  );
}