"use client";
import { useState, useEffect } from "react";
import PlanningTool from "./PlanningTool";
import HistoryChartSimulator from "./HistoryChartSimulator";
import HeatMapSimulator from "./HeatMapSimulator";
import RecentActivityTable from "./RecentActivityTable";
import { useTrafficFlow, useZones } from "../../../hooks/useParking";

export default function StatisticsPage() {
  const { data: zones } = useZones();
  const [filterType, setFilterType] = useState("hour"); 
  const [selection, setSelection] = useState({
    day: "Monday",
    hour: 10,
    zone: zones?.[0]?.name || "Zone A"
  });
  
  // Get zone ID from zone name
  const getZoneId = (zoneName) => {
    if (!zones) return null;
    const zone = zones.find(z => z.name === zoneName || z.code === zoneName);
    return zone?.id || null;
  };

  const zoneId = getZoneId(selection.zone);
  
  const { data: trafficFlowData, isLoading: isLoadingTraffic } = useTrafficFlow(
    zoneId ? {
      zoneId: zoneId,
      hour: selection.hour.toString(),
      filterType: filterType,
      dayOfWeek: filterType === 'hour' ? selection.day : undefined,
    } : null
  );

  useEffect(() => {
    if (zones && !selection.zone) {
      setSelection(prev => ({ ...prev, zone: zones[0]?.name || "Zone A" }));
    }
  }, [zones]);

  const dynamicData = trafficFlowData || [];

  return (
    <main className="w-full px-[150px] space-y-12 bg-parking-tertiary min-h-screen font-inter">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
        <div>
          <h1 className="text-[80px] font-black text-black uppercase tracking-tighter leading-none mb-2">Statistics</h1>
          <p className="text-2xl text-gray-500 font-bold uppercase italic">
            Flow analysis <span className="text-parking-primary">{filterType === 'hour' ? 'per hour' : 'per week'}</span>
          </p>
        </div>
        
        <div className="flex bg-gray-300/40 p-2 rounded-[30px] gap-2 shadow-inner">
          <button 
            onClick={() => setFilterType("day")}
            className={`px-12 py-5 rounded-[25px] text-xl font-black uppercase transition-all ${
              filterType === "day" ? 'bg-white shadow-lg text-parking-primary' : 'text-gray-500'
            }`}
          >By Day</button>
          <button 
            onClick={() => setFilterType("hour")}
            className={`px-12 py-5 rounded-[25px] text-xl font-black uppercase transition-all ${
              filterType === "hour" ? 'bg-white shadow-lg text-parking-primary' : 'text-gray-500'
            }`}
          >By Hour</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <PlanningTool onSelectionChange={setSelection} filterType={filterType} selection={selection} />
        <HistoryChartSimulator 
            data={dynamicData} 
            selectedIndex={filterType === "hour" ? 3 : -1} // Resalta centro en horas, nada en días
            isLoading={isLoadingTraffic}
        />
      </div>

      <div className="grid grid-cols-1 gap-12">
        <HeatMapSimulator zone={selection.zone} zoneId={zoneId} />
        <RecentActivityTable zoneId={zoneId} />
      </div>
    </main>
  );
}