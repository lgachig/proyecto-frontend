"use client";
import { useState } from "react";
import MapTabs from "./MapTabs";
import MapDetailCard from "./MapDetailCard";
import MarkingMap from "../markingpark/MarkingMap"; // Importamos el mapa que creamos

const ZONE_DATA = {
  "Zone A": { percentage: 68, free: 25, occupied: 39, total: 64, mapZone: "ZONA1" },
  "Zone B": { percentage: 45, free: 33, occupied: 27, total: 60, mapZone: "ZONA2" },
  "Zone C": { percentage: 90, free: 5, occupied: 45, total: 50, mapZone: "ZONA3" },
};

export default function ParkingMapSection() {
  const [activeZone, setActiveZone] = useState("Zone A");
  const currentData = ZONE_DATA[activeZone];

  return (
    <div className="w-full p-8">
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
              <div className="w-12 h-6 bg-[#4ADE80] rounded-md border-2 border-white shadow-sm"></div>
              <span className="text-2xl font-bold text-gray-500 uppercase">Free</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-6 bg-[#FACC15] rounded-md border-2 border-white shadow-sm"></div>
              <span className="text-2xl font-bold text-gray-500 uppercase">Selected</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-6 bg-[#FB7D5B] rounded-md border-2 border-white shadow-sm"></div>
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