"use client";
import { BarChart3 } from "lucide-react";

export default function HistoryChartSimulator({ data, selectedIndex }) {
  return (
    <div className="bg-white rounded-[50px] shadow-xl p-12 border border-gray-100 flex flex-col h-full min-h-[750px]">
      <h3 className="text-4xl font-black uppercase flex items-center gap-6 mb-12 text-black">
        <BarChart3 size={45} className="text-[#E77D55]" strokeWidth={4} />
        Average Traffic Flow
      </h3>
      
      <div className="flex-1 w-full bg-[#F3F4F6] rounded-[40px] flex items-end justify-between p-10 gap-6 shadow-inner border border-gray-200">
        {data.map((item, i) => (
          <div key={i} className="flex flex-col items-center gap-4 flex-1 h-full justify-end group">
            <span className={`font-black text-2xl transition-all ${i === selectedIndex ? 'text-[#E77D55] scale-125' : 'text-gray-400'}`}>
              {item.value}%
            </span>
            <div 
              style={{ height: `${item.value}%` }}
              className={`w-full rounded-2xl transition-all duration-700 shadow-lg ${
                i === selectedIndex ? 'bg-[#E77D55] ring-8 ring-orange-100' : 'bg-[#E77D55]/30'
              }`}
            ></div>
            <span className={`text-xl font-black uppercase ${i === selectedIndex ? 'text-black' : 'text-gray-400'}`}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}