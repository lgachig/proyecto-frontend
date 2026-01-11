"use client";
import { BarChart3 } from "lucide-react";

export default function HistoryChartSimulator({ data, selectedIndex, isLoading }) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-[50px] shadow-xl p-12 border border-gray-100 flex flex-col h-full min-h-[750px] font-inter">
        <h3 className="text-4xl font-black uppercase flex items-center gap-6 mb-12 text-black">
          <BarChart3 size={45} className="text-parking-primary" strokeWidth={4} />
          Average Traffic Flow
        </h3>
        <div className="flex-1 w-full bg-[#F3F4F6] rounded-[40px] flex items-center justify-center">
          <p className="text-2xl font-black text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-[50px] shadow-xl p-12 border border-gray-100 flex flex-col h-full min-h-[750px] font-inter">
        <h3 className="text-4xl font-black uppercase flex items-center gap-6 mb-12 text-black">
          <BarChart3 size={45} className="text-parking-primary" strokeWidth={4} />
          Average Traffic Flow
        </h3>
        <div className="flex-1 w-full bg-[#F3F4F6] rounded-[40px] flex items-center justify-center">
          <p className="text-2xl font-black text-gray-400">No data available</p>
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value || 0), 1);
  const normalizedData = data.map(d => ({
    ...d,
    percentage: maxValue > 0 ? Math.round((d.value / maxValue) * 100) : 0
  }));

  return (
    <div className="bg-white rounded-[50px] shadow-xl p-12 border border-gray-100 flex flex-col h-full min-h-[750px] font-inter">
      <h3 className="text-4xl font-black uppercase flex items-center gap-6 mb-12 text-black">
        <BarChart3 size={45} className="text-parking-primary" strokeWidth={4} />
        Average Traffic Flow
      </h3>
      
      <div className="flex-1 w-full bg-[#F3F4F6] rounded-[40px] flex items-end justify-between p-10 gap-6 shadow-inner border border-gray-200">
        {normalizedData.map((item, i) => (
          <div key={i} className="flex flex-col items-center gap-4 flex-1 h-full justify-end group">
            <span className={`font-black text-2xl transition-all ${i === selectedIndex ? 'text-parking-primary scale-125' : 'text-gray-400'}`}>
              {item.value || 0}
            </span>
            <div 
              style={{ 
                height: `${item.percentage}%`, 
                backgroundColor: i === selectedIndex ? 'var(--color-primary)' : 'rgba(231, 125, 85, 0.3)' 
              }}
              className={`w-full rounded-2xl transition-all duration-700 shadow-lg ${
                i === selectedIndex ? 'ring-8 ring-orange-100' : ''
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