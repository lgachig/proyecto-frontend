"use client";
import { useState } from "react";
import MapTabs from "./MapTabs";
import MapDetailCard from "./MapDetailCard";

const ZONE_DATA = {
  "Zone A": { percentage: 68, free: 25, occupied: 39, total: 64, mapLabel: "MAPA 1" },
  "Zone B": { percentage: 45, free: 33, occupied: 27, total: 60, mapLabel: "MAPA 2" },
  "Zone C": { percentage: 90, free: 5, occupied: 45, total: 50, mapLabel: "MAPA 3" },
};

export default function ParkingMapSection() {
  const [activeZone, setActiveZone] = useState("Zone A");
  const currentData = ZONE_DATA[activeZone];

  return (
    <div className="w-full p-8">
      <MapTabs activeZone={activeZone} setActiveZone={setActiveZone} />

      {/* Grid Principal: Usamos h-full y min-h para definir el tamaño del bloque blanco */}
      <div className="bg-white rounded-tr-3xl rounded-br-3xl rounded-bl-3xl shadow-xl p-20 grid grid-cols-1 lg:grid-cols-3 gap-12 items-stretch min-h-[850px]">
        
        {/* COLUMNA IZQUIERDA: Mapa y Leyenda */}
        <div className="lg:col-span-2 flex flex-col h-full">
          
          {/* MAPA: Ocupa el espacio principal */}
          <div className="flex-1 bg-blue-50 border-4 border-dashed border-blue-200 rounded-4xl flex items-center justify-center relative">
            <div className="text-center">
              <p className="text-5xl font-black text-blue-300 uppercase tracking-widest">
                Aquí va el {currentData.mapLabel}
              </p>
              <p className="text-2xl text-blue-400 mt-4 font-medium italic">
                Cargando vista de {activeZone}...
              </p>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: Detalles (MapDetailCard) */}
        <div className="lg:col-span-1 flex">
          {/* El componente MapDetailCard ahora ocupará el h-full del grid padre */}
          <MapDetailCard data={currentData} zoneName={activeZone} />
        </div>


          {/* LEYENDA: Fuera del cuadro azul, pero dentro de la columna del mapa */}
          <div className="flex gap-12 mt-8 ml-4 h-12 items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-6 bg-[#21C55D] rounded-md"></div>
              <span className="text-2xl font-bold text-gray-500 uppercase">Free</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-6 bg-[#FB7D5B] rounded-md"></div>
              <span className="text-2xl font-bold text-gray-500 uppercase">Occupied</span>
            </div>
          </div>
      </div>
    </div>
  );
}