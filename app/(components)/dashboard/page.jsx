"use client";
import { useState, useEffect } from "react";
import dynamic from 'next/dynamic';

const MarkingMap = dynamic(() => import('../markingpark/MarkingMap'), { ssr: false });

import { StatCard } from "./StatCard";
import { AlertLog } from "./AlertLog";
import { OccupationChart } from "./OccupationChart";
import { QRActionButton, QRModal } from "./AccessControl";

export default function DashboardPage() {
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isInside, setIsInside] = useState(false);
  const [segundos, setSegundos] = useState(0);

  const userProfile = { role: "Estudiante", rates: { "Estudiante": 0.25 } };
  const currentRate = userProfile.rates[userProfile.role];

  useEffect(() => {
    let interval;
    if (isInside) {
      interval = setInterval(() => setSegundos(s => s + 1), 100);
    } else {
      setSegundos(0);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isInside]);

  const costoActual = (segundos * (currentRate / 36000)).toFixed(4);

  return (
    <div className="min-h-screen bg-parking-primary px-[150px] py-16 flex flex-col font-inter">
      <QRModal 
        isOpen={isQRModalOpen} 
        onClose={() => setIsQRModalOpen(false)} 
        isInside={isInside}
        onScan={() => { setIsInside(!isInside); setIsQRModalOpen(false); }}
        userType={userProfile.role}
        fee={currentRate}
        segundos={segundos}
      />

      <main className="flex-grow flex flex-col mx-auto w-full">
        <div className="flex justify-between items-center mb-16">
          <h2 className="text-[80px] font-black text-gray-900 tracking-tighter uppercase italic leading-none">
            DASHBOARD
          </h2>
          <QRActionButton onClick={() => setIsQRModalOpen(true)} isInside={isInside} />
        </div>

        <div className="grid grid-cols-12 gap-12 items-stretch">
          <div className="col-span-8 flex flex-col gap-12">
            <div className="grid grid-cols-3 gap-10">
              <StatCard title="SPACES AVAILABLE" value={isInside ? 41 : 42} label="Free" bgColor="var(--color-accent-green)" icon="🚗" />
              <StatCard title="OCCUPIED SPACES" value={isInside ? 79 : 78} label="Occupied" bgColor="var(--color-accent-coral)" icon="🚗" />
              <StatCard title="CURRENT RATE" value={isInside ? `$${costoActual}` : `$${currentRate}`} label={isInside ? "Total" : "x Hour"} bgColor="var(--color-accent-warm)" icon="💰" />
            </div>

            {/* MAPA: Mantenemos tu altura de 900px */}
            <div className="bg-white p-20 rounded-[5rem] shadow-sm flex flex-col h-[900px] border border-black/5">
              <h3 className="text-6xl font-black text-gray-800 mb-10 tracking-tighter italic uppercase">
                MARKING MAP
              </h3>
              <div className="flex-grow bg-[#F9F9F9] rounded-[4rem] border-4 border-dashed border-gray-200 relative overflow-hidden">
                <MarkingMap isUserInside={isInside} />
              </div>

              <div className="flex gap-12 mt-8 ml-4 h-12 items-center">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-6 bg-parking-success rounded-md"></div>
                  <span className="text-2xl font-bold text-gray-500 uppercase">Free</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-6 bg-parking-primary-light rounded-md"></div>
                  <span className="text-2xl font-bold text-gray-500 uppercase">Occupied</span>
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-4 flex flex-col gap-12">
            {/* OCCUPATION CHART: Altura de 400px */}
            <div className="bg-parking-tertiary rounded-[4rem] p-12 shadow-sm border border-gray-50 h-[400px]">
               <h4 className="text-gray-400 font-black italic uppercase mb-8 text-2xl tracking-widest">
                  DAYTIME OCCUPATION
               </h4>
               <OccupationChart data={[35, 55, 45, 95, 70, 110, 85]} />
            </div>
            
            <AlertLog alerts={[
              { message: isInside ? "User Juan Pérez: CHECK-IN SUCCESS" : `User Juan Pérez: PAID $${costoActual}`, time: "NOW", bgColor: isInside ? "bg-parking-accent-green" : "bg-parking-accent-coral" },
              { message: "Zone A exceeds 90% capacity", time: "11:22 AM", bgColor: "bg-parking-accent-coral" }
            ]} />
          </div>
        </div>
      </main>
    </div>
  );
}