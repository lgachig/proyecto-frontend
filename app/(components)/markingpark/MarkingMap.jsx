"use client";
import { MapContainer, TileLayer, Polyline, Marker, useMap } from "react-leaflet";
import { useState, useCallback, useMemo, useEffect } from "react";
import { useZones, useSlots, useReserveSlot } from "../../../hooks/useParking";
import { useCurrentUser } from "../../../hooks/useAuth";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

function ZoneController({ activeZone }) {
  const { data: zones, isLoading } = useZones();
  const map = useMap();

  useEffect(() => {
    if (isLoading || !zones || !activeZone) return;

    const zone = zones.find(z => z.code === activeZone);
    if (!zone) return;

    map.flyTo(
      [zone.center_latitude, zone.center_longitude],
      zone.zoom_level,
      { duration: 1.5 }
    );
  }, [activeZone, zones, isLoading, map]);

  return null;
}

function FollowSlot({ slot }) {
  const map = useMap();

  useEffect(() => {
    if (!slot) return;
    map.flyTo([slot.latitude, slot.longitude], 21, { duration: 0.5 });
  }, [slot?.latitude, slot?.longitude, map]);

  return null;
}

export default function MarkingMap({ isUserInside, forcedZone }) {
  const { data: slotsData, isLoading } = useSlots();
  const [mounted, setMounted] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [routePoints, setRoutePoints] = useState([]);
  const currentUser = useCurrentUser();
  const reserveSlot = useReserveSlot();
  

  useEffect(() => {
    setMounted(true);
  }, []);

  const slots = useMemo(() => {
    if (!slotsData) return [];
    return slotsData;
  }, [slotsData]);

  const obtenerRuta = useCallback((slot) => {
    const inicio = [-0.19896, -78.50220]; 
    const url = `https://router.project-osrm.org/route/v1/driving/${inicio[1]},${inicio[0]};${slot.longitude},${slot.latitude}?overview=full&geometries=geojson`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.routes?.[0]) {
          const routeCoords = data.routes[0].geometry.coordinates.map(
            c => [c[1], c[0]]
          );
          setRoutePoints(routeCoords);
        }
      });
  }, []);

  if (!mounted || isLoading) return null;

  return (
    <div className="w-full h-full relative overflow-hidden rounded-[inherit]">

      {!isUserInside && (
        <div className="absolute inset-0 z-[1000] bg-white/60 backdrop-blur-md flex items-center justify-center">
          <div className="bg-white p-10 rounded-[3rem] shadow-2xl text-center border-b-8 border-orange-400">
            <h4 className="text-3xl font-black uppercase italic text-gray-900">
              SISTEMA BLOQUEADO
            </h4>
          </div>
        </div>
      )}

      {selectedSlot && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[450] bg-gray-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-4">
          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center font-black text-sm">
            P
          </div>
          <span className="text-lg font-black uppercase italic">
            {selectedSlot.slot_number}
          </span>
          <button
            onClick={() => {
              setSelectedSlot(null);
              setRoutePoints([]);
            }}
            className="text-gray-400 hover:text-white ml-2"
          >
            ✕
          </button>
        </div>
      )}

      <MapContainer
        center={[-0.1990, -78.5029]}
        zoom={19}
        className="w-full h-full"
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={24}
          maxNativeZoom={19}
        />

        <ZoneController activeZone={forcedZone} />

        {slots.map(slot => {
          const statusLower = slot.status.toLowerCase();
          const isSelected = selectedSlot?.id === slot.id;

          let color;
          if (statusLower === "occupied") {
            color = "#EF4444"; // 🔴 ROJO
          } else if (statusLower === "reserved") {
            color = "#FACC15"; // 🟡 AMARILLO
          } else if (isSelected) {
            color = "#FACC15"; // 🔶 amarillo si seleccionas
          } else {
            color = "#4ADE80"; // 🟢 VERDE
          }

          return (
            <Marker
              key={slot.id}
              position={[slot.latitude, slot.longitude]}
              eventHandlers={{
                mousedown: (e) => {
                  L.DomEvent.stopPropagation(e);
                  if (!isUserInside || statusLower === "occupied") return;
  
                  setSelectedSlot(slot);
                  obtenerRuta(slot);
  
                  reserveSlot.mutate({
                    slotId: slot.id,
                    zoneId: slot.zone_id,
                    userId: currentUser?.id
                  });
                }
              }}
              icon={L.divIcon({
                html: `<div style="
                  background-color: ${color};
                  width: 18px;
                  height: 18px;
                  border-radius: 4px;
                  border: 2px solid white;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.25);
                "></div>`,
                className: "",
                iconSize: [18, 18],
                iconAnchor: [9, 9]
              })}
            />
          );
        })}

        {selectedSlot && <FollowSlot slot={selectedSlot} />}

        {routePoints.length > 0 && (
          <Polyline
            positions={routePoints}
            pathOptions={{
              color: "#3B82F6",
              weight: 6,
              dashArray: "1, 12",
              lineCap: "round"
            }}
          />
        )}
      </MapContainer>
    </div>
  );
}