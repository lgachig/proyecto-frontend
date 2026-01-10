"use client";
import { MapContainer, TileLayer, Polyline, Marker, useMap } from "react-leaflet";
import { useState, useCallback, useMemo, useEffect } from "react";
import { useZones, useSlots, useReserveSlot, useActiveSession } from "../../../hooks/useParking";
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
    if (!slot || !slot.latitude || !slot.longitude) return;
    if (typeof slot.latitude !== 'number' || typeof slot.longitude !== 'number') return;
    map.flyTo([slot.latitude, slot.longitude], 21, { duration: 0.5 });
  }, [slot?.latitude, slot?.longitude, map]);

  return null;
}

export default function MarkingMap({ isUserInside, forcedZone, selectedSlot: propSelectedSlot, onSelectSlot }) {
  const { data: zones } = useZones();
  const [currentZone, setCurrentZone] = useState(null);
  // Only filter by zone when forcedZone is provided, otherwise show all slots
  const { data: slotsData, isLoading } = useSlots(forcedZone ? currentZone?.id : null);
  const [mounted, setMounted] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(propSelectedSlot || null);
  const [routePoints, setRoutePoints] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const currentUser = useCurrentUser();
  const reserveSlot = useReserveSlot();
  const activeSession = useActiveSession(currentUser?.id);
  
  // Check if user has an active session with occupied or reserved slot
  const activeSlotInfo = useMemo(() => {
    if (!activeSession?.data || !activeSession.data.slot_id) return null;
    // Find the slot to check its status
    const userSlot = slotsData?.find(s => s.id === activeSession.data.slot_id);
    if (userSlot && (userSlot.status === 'occupied' || userSlot.status === 'reserved')) {
      return {
        slot: userSlot,
        status: userSlot.status,
        session: activeSession.data
      };
    }
    return null;
  }, [activeSession?.data, slotsData]);
  
  const hasActiveSlot = !!activeSlotInfo;
  

  useEffect(() => {
    setMounted(true);
    
    // Get user's current location with better error handling
    if (typeof window !== 'undefined' && navigator.geolocation) {
      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (position.coords.latitude && position.coords.longitude) {
            setUserLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
          }
        },
        (error) => {
          // Silently fail - location is optional
          console.log('Location not available:', error.code);
          // Use default location if geolocation fails
          setUserLocation({
            lat: -0.1990,
            lng: -78.5029,
          });
        },
        options
      );

      // Watch position for updates
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          if (position.coords.latitude && position.coords.longitude) {
            setUserLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
          }
        },
        () => {},
        options
      );

      return () => {
        navigator.geolocation.clearWatch(watchId);
      };
    } else {
      // Fallback to default location
      setUserLocation({
        lat: -0.1990,
        lng: -78.5029,
      });
    }
  }, []);

  // Set current zone based on forcedZone or first zone
  useEffect(() => {
    if (zones && zones.length > 0) {
      if (forcedZone) {
        const zone = zones.find(z => z.code === forcedZone || z.name === forcedZone);
        setCurrentZone(zone || zones[0]);
      } else {
        setCurrentZone(zones[0]);
      }
    }
  }, [zones, forcedZone]);

  const slots = useMemo(() => {
    if (!slotsData) return [];
    // Only filter by zone if forcedZone is provided, otherwise show all
    if (forcedZone && currentZone) {
      return slotsData.filter(s => s.zone_id === currentZone.id);
    }
    return slotsData;
  }, [slotsData, currentZone, forcedZone]);

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
    <div className="w-full h-full relative overflow-hidden rounded-[inherit]" style={{ zIndex: 0, position: 'relative' }}>

      {!isUserInside && (
        <div className="absolute inset-0 z-[10] bg-white/60 backdrop-blur-md flex items-center justify-center">
          <div className="bg-white p-10 rounded-[3rem] shadow-2xl text-center border-b-8 border-orange-400">
            <h4 className="text-3xl font-black uppercase italic text-gray-900">
              SISTEMA BLOQUEADO
            </h4>
          </div>
        </div>
      )}

      {/* Show active slot info if user has occupied/reserved slot */}
      {hasActiveSlot && activeSlotInfo && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[20] bg-gray-900 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 min-w-[300px]">
          <div className={`w-10 h-10 ${activeSlotInfo.status === 'occupied' ? 'bg-red-500' : 'bg-yellow-500'} rounded-full flex items-center justify-center font-black text-sm`}>
            P
          </div>
          <div className="flex-1">
            <span className="text-lg font-black uppercase italic block">
              {activeSlotInfo.slot.slot_number}
            </span>
            <span className="text-xs text-gray-300 uppercase">
              {activeSlotInfo.status === 'occupied' ? 'Ocupado' : 'Reservado'}
            </span>
          </div>
        </div>
      )}

      {/* Show selected slot info */}
      {selectedSlot && !hasActiveSlot && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[20] bg-gray-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-4">
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
        center={currentZone ? [currentZone.center_latitude, currentZone.center_longitude] : [-0.1990, -78.5029]}
        zoom={currentZone?.zoom_level || 19}
        className="w-full h-full"
        zoomControl={false}
        style={{ zIndex: 0, position: 'relative' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={24}
          maxNativeZoom={19}
        />

        <ZoneController activeZone={currentZone?.code || forcedZone} />
        
        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={L.divIcon({
              html: `<div style="
                background-color: #3B82F6;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              "></div>`,
              className: "",
              iconSize: [20, 20],
              iconAnchor: [10, 10]
            })}
          />
        )}

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

          // Validate coordinates
          if (!slot.latitude || !slot.longitude || 
              typeof slot.latitude !== 'number' || typeof slot.longitude !== 'number') {
            return null;
          }

          return (
            <Marker
              key={slot.id}
              position={[slot.latitude, slot.longitude]}
              eventHandlers={{
                mousedown: (e) => {
                  L.DomEvent.stopPropagation(e);
                  // Prevent selection if user has active session with occupied/reserved slot
                  if (hasActiveSlot) {
                    // Error will be shown via toast in parent component
                    return;
                  }
                  if (!isUserInside || statusLower === "occupied") return;
  
                  const newSelectedSlot = slot;
                  setSelectedSlot(newSelectedSlot);
                  if (onSelectSlot) {
                    onSelectSlot(newSelectedSlot);
                  }
                  obtenerRuta(slot);
  
                  reserveSlot.mutate({
                    slotId: slot.id,
                    zoneId: slot.zone_id,
                    userId: currentUser?.id
                  }, {
                    onSuccess: () => {
                      // Slot reserved successfully
                    },
                    onError: (error) => {
                      // Error will be handled by parent component with toast
                      setSelectedSlot(null);
                      if (onSelectSlot) {
                        onSelectSlot(null);
                      }
                    }
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