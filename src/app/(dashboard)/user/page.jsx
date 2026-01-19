"use client";
import dynamic from 'next/dynamic';

const MarkingMap = dynamic(() => import('../../../components/map/MapView'), { 
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center font-black animate-pulse bg-slate-100 rounded-[3rem]">
      SINCRONIZANDO GPS UCE...
    </div>
  )
});

export default function UserDashboard() {
  return (
    <div className="h-full w-full relative">
      <div className="h-full w-full rounded-[3rem] overflow-hidden border-4 border-white shadow-2xl relative">
        <MarkingMap />
      </div>
      
      {/* Badge Flotante de GPS */}
      <div className="absolute top-6 left-6 z-[500] bg-white/90 px-4 py-2 rounded-xl shadow-lg border-l-4 border-[#003366]">
        <p className="text-[10px] font-black text-gray-400 uppercase leading-tight">Navegación</p>
        <p className="text-xs font-black text-[#003366] uppercase italic">GPS Activo</p>
      </div>
    </div>
  );
}