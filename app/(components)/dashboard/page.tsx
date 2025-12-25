import { StatCard } from "./StatCard";
import { AlertLog } from "./AlertLog";
import { OccupationChart } from "./OccupationChart";

export default function DashboardPage() {
  const statsData = [
    { title: "Spaces available", value: 42, label: "Free", bgColor: "#E1E9DE", icon: "🚗" },
    { title: "Occupied spaces", value: 78, label: "Occupied", bgColor: "#FFD5C2", icon: "🚗" },
    { title: "Occupancy percentage", value: 65, label: "%", bgColor: "#FEDCB7", icon: "📈" },
  ];

  const chartData = [35, 55, 45, 95, 70, 110, 85,];

  const alertsData = [
    { message: "High congestion detected", time: "11:22 AM", bgColor: "bg-[#FBE8D9]" },
    { message: "Zone A exceeds 90%", time: "11:22 AM", bgColor: "bg-[#FBE8D9]" },
    { message: "Zone C exceeds 90%", time: "11:22 AM", bgColor: "bg-[#FBE8D9]" },
  ];

  return (
    <div className="min-h-screen bg-[#FBF0EA] px-[150px] py-16 flex flex-col font-inter">
      <main className="flex-grow flex flex-col mx-auto w-full">
        <h2 className="text-[80px] font-black text-gray-900 mb-16 tracking-tighter leading-none">
          Dashboard
        </h2>

        <div className="grid grid-cols-12 gap-12 flex-grow items-stretch">
          
          {/* LADO IZQUIERDO: Stats + Mapa */}
          <div className="col-span-8 flex flex-col gap-12">
            <div className="grid grid-cols-3 gap-10">
              {statsData.map((stat, i) => (
                <StatCard key={i} {...stat} />
              ))}
            </div>

            <div className="bg-white p-20 rounded-[5rem] shadow-sm flex flex-col min-h-[700px] flex-grow">
              <h3 className="text-6xl font-black text-gray-800 mb-10 tracking-tighter italic text-center md:text-left">Marking map</h3>
              <div className="flex-grow bg-[#F9F9F9] rounded-[4rem] border-4 border-dashed border-gray-200 flex items-center justify-center">
                 <span className="text-gray-200 font-black text-[120px] tracking-[0.3em] uppercase opacity-20 select-none">MAP VIEW</span>
              </div>
            </div>
          </div>

          {/* LADO DERECHO: Gráfica + Alertas (Sin cambios de tamaño) */}
          <div className="col-span-4 flex flex-col gap-12 ">
            <div className=" bg-[#FEF8F3] rounded-[4rem] p-12 shadow-sm flex flex-col border border-gray-50 h-[300px] ">
               <h4 className="text-gray-400 font-black italic uppercase mb-8 text-2xl tracking-widest ">Daytime occupation</h4>
               <div className="flex-grow ">
                  <OccupationChart data={chartData} />
               </div>
            </div>
            <div className="flex-grow ">
              <AlertLog alerts={alertsData} />
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}