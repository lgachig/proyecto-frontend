"use client";
import { useState } from "react";
// Importaciones ajustadas a tu estructura (todos en la misma carpeta)
import { StatCard } from "./StatCard";
import { AlertLog } from "./AlertLog";
import { OccupationChart } from "./OccupationChart";
import { QRActionButton, QRModal } from "./AccessControl";

export default function DashboardPage() {
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isInside, setIsInside] = useState(false);

  // Configuración de Perfil y Tarifas (Simulado para la UCE)
  const userProfile = {
    role: "Estudiante", 
    rates: { "Estudiante": 0.25, "Docente": 0.50, "Externo": 1.50 }
  };
  const currentRate = userProfile.rates[userProfile.role];

  const handleStatusToggle = () => setIsInside(!isInside);

  // Datos para las StatCards
  const statsData = [
    { title: "Spaces available", value: isInside ? 41 : 42, label: "Free", bgColor: "#E1E9DE", icon: "🚗" },
    { title: "Occupied spaces", value: isInside ? 79 : 78, label: "Occupied", bgColor: "#FFD5C2", icon: "🚗" },
    { title: "Current Rate", value: `$${currentRate}`, label: "x Hour", bgColor: "#FEDCB7", icon: "💰" },
  ];

  const chartData = [35, 55, 45, 95, 70, 110, 85];

  // Alertas que reaccionan al cambio de estado
  const alertsData = [
    { 
      message: isInside ? "User Juan Pérez: CHECK-IN SUCCESS" : `User Juan Pérez: PAID $${(currentRate * 2.25).toFixed(2)}`, 
      time: "NOW", 
      bgColor: isInside ? "bg-[#E1E9DE]" : "bg-[#FBE8D9]" 
    },
    { message: "Zone A exceeds 90% capacity", time: "11:22 AM", bgColor: "bg-[#FBE8D9]" },
    { message: "Zone C exceeds 90% capacity", time: "11:22 AM", bgColor: "bg-[#FBE8D9]" },
  ];

  return (
    <div className="min-h-screen bg-[#FBF0EA] px-[150px] py-16 flex flex-col font-inter relative">
      
      {/* MODAL DEL QR */}
      <QRModal 
        isOpen={isQRModalOpen} 
        onClose={() => setIsQRModalOpen(false)} 
        isInside={isInside}
        onScan={handleStatusToggle}
        userType={userProfile.role}
        fee={currentRate}
        userName="JUAN PÉREZ" 
      />

      <main className="flex-grow flex flex-col mx-auto w-full">
        
        {/* HEADER: Título + Botón dinámico */}
        <div className="flex justify-between items-center mb-16">
          <h2 className="text-[80px] font-black text-gray-900 tracking-tighter leading-none uppercase italic">
            Dashboard
          </h2>
          <QRActionButton onClick={() => setIsQRModalOpen(true)} isInside={isInside} />
        </div>

        <div className="grid grid-cols-12 gap-12 flex-grow items-stretch">
          
          {/* LADO IZQUIERDO: Stats + Mapa */}
          <div className="col-span-8 flex flex-col gap-12">
            <div className="grid grid-cols-3 gap-10">
              {statsData.map((stat, i) => (
                <StatCard key={i} {...stat} />
              ))}
            </div>

            {/* MARCO DEL MAPA */}
            <div className="bg-white p-20 rounded-[5rem] shadow-sm flex flex-col min-h-[700px] flex-grow border border-black/5">
              <h3 className="text-6xl font-black text-gray-800 mb-10 tracking-tighter italic uppercase">
                Marking map
              </h3>
              <div className="flex-grow bg-[#F9F9F9] rounded-[4rem] border-4 border-dashed border-gray-200 flex items-center justify-center relative overflow-hidden group">
                {isInside ? (
                   <div className="text-center animate-in zoom-in duration-500">
                     <span className="text-9xl block mb-4">📍</span>
                     <p className="font-black text-3xl uppercase tracking-tighter text-gray-800 italic">Slot A-12 Assigned</p>
                     <p className="text-gray-400 font-bold uppercase mt-2 tracking-widest text-sm">Active GPS Tracking...</p>
                   </div>
                ) : (
                   <span className="text-gray-200 font-black text-[120px] tracking-[0.3em] uppercase opacity-20 select-none group-hover:scale-110 transition-transform duration-700">
                      MAP VIEW
                   </span>
                )}
              </div>
            </div>
          </div>

          {/* LADO DERECHO: Gráfica + Alertas */}
          <div className="col-span-4 flex flex-col gap-12">
            
            {/* GRÁFICA CON TÍTULO RECUPERADO */}
            <div className="bg-[#FEF8F3] rounded-[4rem] p-12 shadow-sm flex flex-col border border-gray-50 h-[300px]">
               <h4 className="text-gray-400 font-black italic uppercase mb-8 text-2xl tracking-widest">
                  Daytime occupation
               </h4>
               <div className="flex-grow">
                  <OccupationChart data={chartData} />
               </div>
            </div>
            
            {/* ALERT LOG */}
            <div className="flex-grow">
              <AlertLog alerts={alertsData} />
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}