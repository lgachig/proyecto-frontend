"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { StatCard } from "./StatCard";
import { AlertLog } from "./AlertLog";
import { OccupationChart } from "./OccupationChart";
import { QRActionButton, QRModal } from "./AccessControl";
import { useCurrentUser } from "../../../hooks/useAuth";
import {
  useStatistics,
  useActiveSession,
  useStartSession,
} from "../../../hooks/useParking";

const MarkingMap = dynamic(() => import("../markingpark/MarkingMap"), {
  ssr: false,
});

export default function DashboardPage() {
  const currentUser = useCurrentUser();

  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [sessionState, setSessionState] = useState("idle"); // idle | active
  const [segundos, setSegundos] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const statistics = useStatistics();
  const activeSessions = useActiveSession(currentUser?.id);
  const startSession = useStartSession();

  const isInside = sessionState === "active";

  const handleScan = () => {
    // Escaneo de entrada: Crea la sesión primero
    if (!isInside) {
      startSession.mutate({
        user_id: currentUser?.id,
        entry_method: "qr",
        slot_id: null, // Se crea sin slot inicialmente para habilitar el mapa
      }, {
        onSuccess: () => {
          setSessionState("active");
          setIsQRModalOpen(false);
        }
      });
    } else {
      // Escaneo de salida
      setIsQRModalOpen(false);
    }
  };

  useEffect(() => {
    if (activeSessions?.data?.status === "active") {
      setSessionState("active");
      if (activeSessions.data.slot_id) {
        setSelectedSlot(activeSessions.data.slot_id);
      }
    } else {
      setSessionState("idle");
      setSegundos(0);
      setSelectedSlot(null);
    }
  }, [activeSessions?.data]);

  useEffect(() => {
    if (sessionState !== "active" || !activeSessions?.data?.entry_time) return;

    const entryTime = new Date(activeSessions.data.entry_time);

    const updateSeconds = () => {
      const now = new Date();
      const diff = Math.floor((now - entryTime) / 1000);
      setSegundos(diff > 0 ? diff : 0);
    };

    updateSeconds();
    const interval = setInterval(updateSeconds, 1000);

    return () => clearInterval(interval);
  }, [sessionState, activeSessions?.data?.entry_time]);

  const userProfile = {
    role: currentUser?.role?.name || "Student",
    rates: { Student: 0.25, Teacher: 0.50, Admin: 0.00 },
  };

  const baseRate =
    activeSessions?.data?.base_rate ?? (userProfile.rates[userProfile.role] || 0.25);

  const costoActual = ((segundos / 3600) * baseRate).toFixed(4);

  return (
    <div className="min-h-screen bg-parking-primary px-[150px] py-16 flex flex-col font-inter">
      <QRModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        isInside={isInside}
        userType={userProfile.role}
        fee={baseRate}
        segundos={segundos}
        onCreateSession={handleScan}
      />

      <main className="flex-grow flex flex-col mx-auto w-full">
        <div className="flex justify-between items-center mb-16">
          <h2 className="text-[80px] font-black text-gray-900 tracking-tighter uppercase italic leading-none">
            DASHBOARD
          </h2>
          <QRActionButton 
            onClick={() => setIsQRModalOpen(true)}
            isInside={isInside} />
        </div>

        <div className="grid grid-cols-12 gap-12 items-stretch">
          <div className="col-span-8 flex flex-col gap-12">
            <div className="grid grid-cols-3 gap-10">
              <StatCard
                title="SPACES AVAILABLE"
                value={statistics.data?.available}
                label="Free"
                bgColor="var(--color-accent-green)"
                icon="🚗"
              />
              <StatCard
                title="OCCUPIED SPACES"
                value={
                  (statistics.data?.total ?? 0) -
                  (statistics.data?.available ?? 0)
                }
                label="Occupied"
                bgColor="var(--color-accent-coral)"
                icon="🚗"
              />
              <StatCard
                title="CURRENT RATE"
                value={isInside ? `$${costoActual}` : `$${baseRate}`}
                label={isInside ? "Total" : "x Hour"}
                bgColor="var(--color-accent-warm)"
                icon="💰"
              />
            </div>

            <div className="bg-white p-20 rounded-[5rem] shadow-sm flex flex-col h-[900px] border border-black/5">
              <h3 className="text-6xl font-black text-gray-800 mb-10 tracking-tighter italic uppercase">
                MARKING MAP
              </h3>

              <div className="flex-grow bg-[#F9F9F9] rounded-[4rem] border-4 border-dashed border-gray-200 relative overflow-hidden">
                <MarkingMap
                  isUserInside={isInside}
                  selectedSlot={selectedSlot}
                  onSelectSlot={setSelectedSlot}
                />
              </div>
            </div>
          </div>

          <div className="col-span-4 flex flex-col gap-12">
            <div className="bg-parking-tertiary rounded-[4rem] p-12 shadow-sm border border-gray-50 h-[400px]">
              <h4 className="text-gray-400 font-black italic uppercase mb-8 text-2xl tracking-widest">
                DAYTIME OCCUPATION
              </h4>
              <OccupationChart data={[35, 55, 45, 95, 70, 110, 85]} />
            </div>

            <AlertLog
              alerts={[
                {
                  message:
                    isInside
                      ? `User ${currentUser?.full_name || 'Usuario'}: SESSION ACTIVE`
                      : `User ${currentUser?.full_name || 'Usuario'}: WAITING ENTRANCE`,
                  time: "NOW",
                  bgColor:
                    isInside
                      ? "bg-parking-accent-green"
                      : "bg-parking-accent-warm",
                },
              ]}
            />
          </div>
        </div>
      </main>
    </div>
  );
}