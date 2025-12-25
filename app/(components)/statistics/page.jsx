"use client";
import { useState, useEffect } from "react";
import PlanningTool from "./PlanningTool";
import HistoryChartSimulator from "./HistoryChartSimulator";
import HeatMapSimulator from "./HeatMapSimulator";
import RecentActivityTable from "./RecentActivityTable";

export default function StatisticsPage() {
  const [filterType, setFilterType] = useState("hour"); 
  const [selection, setSelection] = useState({
    day: "Monday",
    hour: 10,
    zone: "Zone C"
  });
  const [dynamicData, setDynamicData] = useState([]);

  useEffect(() => {
    let points = [];
    
    if (filterType === "hour") {
      // Muestra flujo de horas para el día seleccionado
      for (let i = -3; i <= 3; i++) {
        let currentHour = (selection.hour + i + 24) % 24;
        const suffix = currentHour >= 12 ? "PM" : "AM";
        const displayHour = currentHour % 12 || 12;
        points.push({
          label: `${displayHour}${suffix}`,
          value: i === 0 ? Math.floor(Math.random() * 20) + 75 : Math.floor(Math.random() * 50) + 15 
        });
      }
    } else {
      // Muestra Lunes a Sábado para la hora seleccionada
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      points = days.map(d => ({
        label: d,
        // Resaltamos el día actual si coincide, o simplemente variamos datos
        value: Math.floor(Math.random() * 70) + 20
      }));
    }
    setDynamicData(points);
  }, [selection, filterType]);

  return (
    <main className="w-full p-12 space-y-12 bg-[#FFF8F2] min-h-screen">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
        <div>
          <h1 className="text-[80px] font-black text-black uppercase tracking-tighter leading-none mb-2">Statistics</h1>
          <p className="text-2xl text-gray-500 font-bold uppercase italic">
            Flow analysis <span className="text-[#E77D55]">{filterType === 'hour' ? 'per hour' : 'per week'}</span>
          </p>
        </div>
        
        <div className="flex bg-gray-300/40 p-2 rounded-[30px] gap-2 shadow-inner">
          <button 
            onClick={() => setFilterType("day")}
            className={`px-12 py-5 rounded-[25px] text-xl font-black uppercase transition-all ${
              filterType === "day" ? 'bg-white shadow-lg text-[#E77D55]' : 'text-gray-500'
            }`}
          >By Day</button>
          <button 
            onClick={() => setFilterType("hour")}
            className={`px-12 py-5 rounded-[25px] text-xl font-black uppercase transition-all ${
              filterType === "hour" ? 'bg-white shadow-lg text-[#E77D55]' : 'text-gray-500'
            }`}
          >By Hour</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <PlanningTool onSelectionChange={setSelection} filterType={filterType} selection={selection} />
        <HistoryChartSimulator 
            data={dynamicData} 
            selectedIndex={filterType === "hour" ? 3 : -1} // Resalta centro en horas, nada en días
        />
      </div>

      <div className="grid grid-cols-1 gap-12">
        <HeatMapSimulator zone={selection.zone} />
        <RecentActivityTable />
      </div>
    </main>
  );
}