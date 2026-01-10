"use client";
import { useState, useMemo, useEffect } from "react";
import MapTabs from "./MapTabs";
import MapDetailCard from "./MapDetailCard";
import MarkingMap from "../markingpark/MarkingMap";
import { useZones, useStatistics } from "../../../hooks/useParking";

export default function ParkingMapSection() {
  const { data: zones } = useZones();
  const [activeZone, setActiveZone] = useState(null);
  
  // Initialize active zone with first zone from backend
  useEffect(() => {
    if (zones && zones.length > 0 && !activeZone) {
      setActiveZone(zones[0].name);
    }
  }, [zones, activeZone]);
  
  // Find current zone
  const currentZone = useMemo(() => {
    if (!activeZone && zones && zones.length > 0) {
      return zones[0];
    }
    return zones?.find(z => z.name === activeZone || z.code === activeZone);
  }, [zones, activeZone]);
  
  // Get statistics for current zone
  const { data: zoneStats } = useStatistics(currentZone?.id);
  
  // Calculate data from real backend statistics
  const currentData = useMemo(() => {
    if (!zoneStats || !currentZone) {
      return { percentage: 0, free: 0, occupied: 0, total: 0, mapZone: currentZone?.code || "ZONA1" };
    }
    
    const total = zoneStats.total || 0;
    const free = zoneStats.available || 0;
    const occupied = (zoneStats.occupied || 0) + (zoneStats.reserved || 0);
    const percentage = zoneStats.occupancy_percentage || 0;
    
    return {
      percentage,
      free,
      occupied,
      total,
      mapZone: currentZone.code || currentZone.name
    };
  }, [zoneStats, currentZone]);

  return (
    <div className="w-full p-8 font-inter">
      <MapTabs activeZone={activeZone} setActiveZone={setActiveZone} />

      <div className="bg-white rounded-tr-3xl rounded-br-3xl rounded-bl-3xl shadow-xl p-20 grid grid-cols-1 lg:grid-cols-3 gap-12 items-stretch min-h-[900px]">
        
        {/* COLUMNA IZQUIERDA: El Mapa Real */}
        <div className="lg:col-span-2 flex flex-col h-full">
          <div className="flex-1 bg-gray-100 rounded-4xl overflow-hidden relative border-2 border-gray-100 shadow-inner">
            {/* INYECTAMOS EL MAPA AQUÍ */}
            <MarkingMap 
              isUserInside={true} 
              forcedZone={currentData.mapZone} // Pasamos la zona de la Tab
            />
          </div>

          {/* LEYENDA */}
          <div className="flex gap-12 mt-8 ml-4 h-12 items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-6 bg-parking-success rounded-md border-2 border-white shadow-sm"></div>
              <span className="text-2xl font-bold text-gray-500 uppercase">Free</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-6 bg-parking-warning rounded-md border-2 border-white shadow-sm" style={{ backgroundColor: 'var(--color-warning)' }}></div>
              <span className="text-2xl font-bold text-gray-500 uppercase">Selected</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-6 bg-parking-primary-light rounded-md border-2 border-white shadow-sm"></div>
              <span className="text-2xl font-bold text-gray-500 uppercase">Occupied</span>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: Detalles */}
        <div className="lg:col-span-1 flex">
          <MapDetailCard data={currentData} zoneName={activeZone} />
        </div>
      </div>
    </div>
  );
} 