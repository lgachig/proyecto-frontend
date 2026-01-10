"use client";
import { TrendingUp } from "lucide-react";
import { useZones } from "../../../hooks/useParking";

export default function PlanningTool({ onSelectionChange, filterType, selection }) {
  const { data: zones } = useZones();
  
  const hours = [
    { label: "07:00 AM", value: 7 }, { label: "08:00 AM", value: 8 },
    { label: "09:00 AM", value: 9 }, { label: "10:00 AM", value: 10 },
    { label: "11:00 AM", value: 11 }, { label: "12:00 PM", value: 12 },
    { label: "01:00 PM", value: 13 }, { label: "02:00 PM", value: 14 },
    { label: "03:00 PM", value: 15 }
  ];

  const handleUpdate = (key, val) => {
    onSelectionChange(prev => ({ ...prev, [key]: val }));
  };

  // Get zone ID from zone name
  const getZoneId = (zoneName) => {
    if (!zones) return null;
    const zone = zones.find(z => z.name === zoneName || z.code === zoneName);
    return zone?.id || null;
  };

  return (
    <div className="bg-white rounded-[50px] shadow-xl p-12 flex flex-col justify-between border border-gray-100 h-full min-h-[750px] font-inter">
      <div className="space-y-10">
        <div className="flex items-center gap-6 text-parking-primary">
          <TrendingUp size={55} strokeWidth={4} />
          <h2 className="text-4xl font-black uppercase tracking-tighter">Planning Tool</h2>
        </div>
        
        {/* DÍA: Solo se selecciona si estamos analizando HORAS */}
        {filterType === "hour" ? (
          <div className="space-y-4 animate-in fade-in duration-500">
            <label className="text-xl font-black text-gray-400 uppercase italic ml-4">Select Day</label>
            <select 
              onChange={(e) => handleUpdate('day', e.target.value)}
              className="w-full p-8 bg-gray-50 rounded-[35px] text-3xl font-black border-2 border-transparent focus:border-parking-primary outline-none cursor-pointer"
            >
              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        ) : (
          <div className="p-8 bg-gray-100/50 rounded-[35px] border border-dashed border-gray-300">
            <p className="text-center text-gray-400 font-bold uppercase italic">Viewing Full Week Analysis</p>
          </div>
        )}

        {/* HORA: Se selecciona siempre (en modo "Day" sirve para fijar la hora de la semana) */}
        <div className="space-y-4">
          <label className="text-xl font-black text-gray-400 uppercase italic ml-4">
            {filterType === "hour" ? "Select Arrival Time" : "Set Reference Time"}
          </label>
          <select 
            defaultValue={10}
            onChange={(e) => handleUpdate('hour', parseInt(e.target.value))}
            className="w-full p-8 bg-gray-50 rounded-[35px] text-3xl font-black border-2 border-transparent focus:border-parking-primary outline-none cursor-pointer"
          >
            {hours.map(h => (
              <option key={h.value} value={h.value}>{h.label}</option>
            ))}
          </select>
        </div>

        {/* ZONA */}
        <div className="space-y-4">
          <label className="text-xl font-black text-gray-400 uppercase italic ml-4">Select Zone</label>
          <select 
            value={selection.zone || (zones?.[0]?.name || '')}
            onChange={(e) => handleUpdate('zone', e.target.value)}
            className="w-full p-8 bg-gray-50 rounded-[35px] text-3xl font-black border-2 border-transparent focus:border-parking-primary outline-none cursor-pointer"
          >
            {zones?.map(zone => (
              <option key={zone.id} value={zone.name}>{zone.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-12 p-10 bg-parking-primary-action rounded-[45px] text-white shadow-2xl">
        <p className="text-2xl font-black opacity-80 uppercase mb-2">Analysis Context</p>
        <h3 className="text-5xl font-black uppercase leading-tight tracking-tighter">
          {filterType === "hour" ? selection.day : `${selection.hour}:00 Reference`}
        </h3>
        <p className="text-xl font-bold italic mt-4 leading-tight">
          "Showing patterns for {selection.zone}"
        </p>
      </div>
    </div>
  );
}