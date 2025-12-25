"use client";
import { Map as MapIcon } from "lucide-react";

export default function HeatMapSimulator({ zone }) {
  return (
    <div className="bg-[#1A1A1A] rounded-[50px] shadow-2xl p-12 border border-gray-800 flex flex-col h-[600px] w-full">
      <div className="flex justify-between items-center mb-10 px-4">
        <h2 className="text-4xl font-black uppercase text-white flex items-center gap-6">
          <MapIcon size={45} className="text-[#E77D55]" />
          Heat Map Analysis: <span className="text-orange-400">{zone}</span>
        </h2>
        <div className="px-6 py-2 bg-white/5 border border-white/10 rounded-full">
            <span className="text-white/60 font-bold uppercase tracking-widest text-lg">Live Simulation</span>
        </div>
      </div>
      
      <div className="flex-1 w-full bg-neutral-900 overflow-hidden rounded-[40px] relative flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#E77D55]/5 to-transparent h-full w-full animate-pulse"></div>
        <div className="text-center z-10">
          <p className="text-6xl font-black text-white/5 uppercase tracking-[0.4em] mb-4">Thermal Density</p>
          <p className="text-2xl text-[#E77D55] font-bold italic opacity-80 uppercase">Mapping historical flow in {zone}...</p>
        </div>
        {/* Manchas de calor simuladas */}
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-red-600 rounded-full blur-[130px] opacity-20"></div>
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-orange-600 rounded-full blur-[130px] opacity-10"></div>
      </div>
    </div>
  );
}