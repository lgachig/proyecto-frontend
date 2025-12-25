"use client";
import { useState } from "react";
import PlanningTool from "./PlanningTool";
import HistoryChartSimulator from "./HistoryChartSimulator";
import HeatMapSimulator from "./HeatMapSimulator";

export default function StatisticsPage() {
  const [filterType, setFilterType] = useState("day");

  return (
    <main className="w-full p-12 space-y-16 bg-[#FFF8F2]/30 min-h-screen">
      {/* HEADER SECTION GIGANTE */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 px-4">
        <div>
          <h1 className="text-[90px] font-black text-black uppercase tracking-tighter leading-none mb-4">
            Statistics
          </h1>
          <p className="text-3xl text-gray-400 font-bold uppercase tracking-wide">
            Predictive analysis & historical data
          </p>
        </div>
        
        {/* FILTROS DE TIEMPO */}
        <div className="flex bg-gray-200/80 p-3 rounded-[35px] gap-3 shadow-inner">
          {["day", "hour"].map((t) => (
            <button 
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-16 py-7 rounded-[30px] text-2xl font-black uppercase transition-all duration-300 ${
                filterType === t 
                ? 'bg-white shadow-2xl text-[#E77D55] scale-105' 
                : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              By {t}
            </button>
          ))}
        </div>
      </div>

      {/* GRID SIMÉTRICO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 items-stretch">
        {/* PANEL IZQUIERDO */}
        <PlanningTool />
        
        {/* COLUMNA DERECHA: GRÁFICA Y HEATMAP */}
        <div className="lg:col-span-2 space-y-16 flex flex-col h-full">
          <HistoryChartSimulator />
          <HeatMapSimulator />
        </div>
      </div>
    </main>
  );
}