"use client";
import { Car } from 'lucide-react';

interface MapData {
  percentage: number;
  free: number;
  occupied: number;
  total: number;
}

export default function MapDetailCard({ data, zoneName }: { data: MapData, zoneName: string }) {
  return (
    <div className="bg-parking-alt p-12 rounded-[40px] flex flex-col items-center justify-between w-full h-full border border-gray-100 shadow-sm font-inter">
      <div className="text-center pt-10">
        <p className="text-gray-500 text-4xl font-semibold mb-6 uppercase tracking-wider">Occupancy percentage</p>
        {/* Texto de porcentaje mucho más grande */}
        <h2 className="text-[140px] font-black leading-none text-[#333]">{data.percentage}%</h2>
      </div>

      <div className="w-full space-y-12">
        <div className="flex items-center gap-8 px-4">
          <div className="p-5 bg-white rounded-3xl shadow-md">
            <Car size={60} className="text-green-700" strokeWidth={2.5} />
          </div>
          <p className="text-5xl font-extrabold">{data.free} <span className="text-gray-400 font-bold ml-4">Free</span></p>
        </div>

        <div className="flex items-center gap-8 px-4">
          <div className="p-5 bg-white rounded-3xl shadow-md">
            <Car size={60} className="text-red-500" strokeWidth={2.5} />
          </div>
          <p className="text-5xl font-extrabold">{data.occupied} <span className="text-gray-400 font-bold ml-4">Occupied</span></p>
        </div>
      </div>

      <div className="w-full pt-10 border-t-2 border-gray-200 text-center pb-6">
        <p className="text-6xl font-black mb-8 text-[#333]">{zoneName}</p>
        <div className="bg-gray-300/50 py-6 rounded-[30px]">
          <p className="text-4xl font-bold text-gray-600 italic tracking-tight">Total {data.total}</p>
        </div>
      </div>
    </div>
  );
}