"use client";
import { MapContainer, TileLayer, Polyline, Marker, useMap } from "react-leaflet";
import { useState, useCallback, useMemo, useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// --- CONTROLADOR DE CÁMARA ---
function ZoneController({ activeZone }) {
  const map = useMap();
  useEffect(() => {
    const vistas = {
      "ZONA1": { center: [-0.19900, -78.50318], zoom: 21 },
      "ZONA2": { center: [-0.19890, -78.50294], zoom: 22 },
      "ZONA3": { center: [-0.19905, -78.50277], zoom: 21 }
    };
    const vista = vistas[activeZone];
    if (vista) map.flyTo(vista.center, vista.zoom, { duration: 1.5 });
  }, [activeZone, map]);
  return null;
}

export default function MarkingMap({ isUserInside, forcedZone }) {
  const [mounted, setMounted] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [routePoints, setRoutePoints] = useState([]);

  useEffect(() => { setMounted(true); }, []);

  // TUS COORDENADAS EXACTAS
  const coords = useMemo(() => ({
    Z1: [
      [-0.19901878774913273, -78.50331273169526],
      [-0.1988967479771117, -78.50323494763767],
      [-0.199080478183001, -78.50317191572894],
      [-0.19900202404424086, -78.50304451080702]
    ],
    Z2: [
      [-0.1989517329294507, -78.50299891325602],
      [-0.19884578631380226, -78.50293856355616],
      [-0.19897587266456931, -78.50294325742172],
      [-0.19887663153108626, -78.50289631876626]
    ],
    Z3: [
      [-0.19920788233915643, -78.50293789300395],
      [-0.19884779795840607, -78.50274276230775],
      [-0.1989115000375143, -78.50261535738584],
      [-0.1992693783462768, -78.50281790352922]
    ]
  }), []);

  const allSlots = useMemo(() => {
    const slots = [];

    // ZONA 1 (CORREGIDA: LADO INVERSO HACIA EL INTERIOR)
    for (let i = 0; i < 12; i++) {
      const r = i / 11;
      // Fila que ahora cuadra con tu imagen de la DTIC (Alineación vertical interna)
      slots.push({
        id: `Z1-A${i+1}`,
        lat: coords.Z1[1][0] + (coords.Z1[3][0] - coords.Z1[1][0]) * r,
        lng: coords.Z1[1][1] + (coords.Z1[3][1] - coords.Z1[1][1]) * r,
        zona: "Z1",
        vertical: true
      });
      slots.push({
        id: `Z1-B${i+1}`,
        lat: coords.Z1[0][0] + (coords.Z1[2][0] - coords.Z1[0][0]) * r,
        lng: coords.Z1[0][1] + (coords.Z1[2][1] - coords.Z1[0][1]) * r,
        zona: "Z1",
        vertical: true
      });
    }

    // ZONA 2 (6 CARROS - LÍNEA ÚNICA)
    for (let i = 0; i < 6; i++) {
      const r = i / 5;
      slots.push({
        id: `Z2-${i+1}`,
        lat: coords.Z2[0][0] + (coords.Z2[1][0] - coords.Z2[0][0]) * r,
        lng: coords.Z2[0][1] + (coords.Z2[1][1] - coords.Z2[0][1]) * r,
        zona: "Z2"
      });
    }

    // ZONA 3 (30 CARROS - 15 por lado)
    for (let i = 0; i < 15; i++) {
      const r = i / 14;
      slots.push({
        id: `Z3-A${i+1}`,
        lat: coords.Z3[0][0] + (coords.Z3[1][0] - coords.Z3[0][0]) * r,
        lng: coords.Z3[0][1] + (coords.Z3[1][1] - coords.Z3[0][1]) * r,
        zona: "Z3"
      });
      slots.push({
        id: `Z3-B${i+1}`,
        lat: coords.Z3[3][0] + (coords.Z3[2][0] - coords.Z3[3][0]) * r,
        lng: coords.Z3[3][1] + (coords.Z3[2][1] - coords.Z3[3][1]) * r,
        zona: "Z3"
      });
    }

    return slots;
  }, [coords]);

  const obtenerRuta = useCallback((slot) => {
    const inicio = [-0.19896, -78.50220]; 
    const url = `https://router.project-osrm.org/route/v1/driving/${inicio[1]},${inicio[0]};${slot.lng},${slot.lat}?overview=full&geometries=geojson`;
    fetch(url).then(res => res.json()).then(data => {
      if (data.routes?.[0]) {
        const routeCoords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
        setRoutePoints([...routeCoords, [slot.lat, slot.lng]]);
      }
    });
  }, []);

  if (!mounted) return null;

  return (
    <div className="w-full h-full relative overflow-hidden rounded-[inherit]">
      
      {!isUserInside && (
        <div className="absolute inset-0 z-[1000] bg-white/60 backdrop-blur-md flex items-center justify-center">
          <div className="bg-white p-10 rounded-[3rem] shadow-2xl text-center border-b-8 border-orange-400">
             <h4 className="text-3xl font-black uppercase italic text-gray-900 tracking-tighter">SISTEMA BLOQUEADO</h4>
          </div>
        </div>
      )}

      {selectedSlot && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[450] bg-gray-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-4">
           <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center font-black text-sm">P</div>
           <span className="text-lg font-black uppercase italic leading-none">{selectedSlot.id}</span>
           <button onClick={() => {setSelectedSlot(null); setRoutePoints([]);}} className="text-gray-500 hover:text-white ml-2 transition-colors">✕</button>
        </div>
      )}

      <MapContainer center={[-0.1990, -78.5029]} zoom={19} className="w-full h-full z-0" zoomControl={false}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" maxZoom={24} maxNativeZoom={19} />
        
        <ZoneController activeZone={forcedZone} />
        
        {allSlots.map(slot => (
          <Marker 
            key={slot.id} 
            position={[slot.lat, slot.lng]}
            eventHandlers={{ mousedown: (e) => { L.DomEvent.stopPropagation(e); if (isUserInside) { setSelectedSlot(slot); obtenerRuta(slot); } } }}
            icon={L.divIcon({ 
              html: `<div style="
                background-color: ${selectedSlot?.id === slot.id ? '#FACC15' : '#4ADE80'}; 
                width: ${slot.vertical ? '14px' : '20px'}; 
                height: ${slot.vertical ? '24px' : '16px'}; 
                border: 2px solid white; 
                border-radius: 3px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
              "></div>`, 
              className: "marker-pin", 
              iconSize: slot.vertical ? [14, 24] : [20, 16], 
              iconAnchor: slot.vertical ? [7, 12] : [10, 8]
            })}
          />
        ))}

        {routePoints.length > 0 && (
          <Polyline positions={routePoints} pathOptions={{ color: "#3B82F6", weight: 6, dashArray: "1, 12", lineCap: "round" }} />
        )}
      </MapContainer>
    </div>
  );
}