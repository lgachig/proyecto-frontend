"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { 
  BarChart3, 
  Users, 
  Car, 
  Clock, 
  ArrowUpRight, 
  ArrowDownLeft,
  Download,
  Loader2
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const exportToPDF = (stats, history) => {
  const doc = new jsPDF("landscape");

  doc.setFontSize(18);
  doc.text("Reporte de Uso - Parqueadero UCE", 14, 20);

  doc.setFontSize(11);
  doc.text(`Generado: ${new Date().toLocaleString()}`, 14, 28);

  doc.setFontSize(12);
  doc.text(`Sesiones Totales: ${stats.totalSessions}`, 14, 40);
  doc.text(`Ocupación Actual: ${stats.activeNow}`, 14, 48);
  doc.text(`Puesto Más Usado: ${stats.mostUsedSlot}`, 14, 56);
  doc.text(`Tiempo Promedio: ${stats.avgTime}`, 14, 64);

  autoTable(doc, {
    startY: 75,
    head: [["Usuario", "Puesto", "Entrada", "Salida", "Estado"]],
    body: history.map((row) => [
      row.profiles?.full_name || "-",
      row.parking_slots?.number || "-",
      new Date(row.start_time).toLocaleString(),
      row.end_time ? new Date(row.end_time).toLocaleString() : "En curso",
      row.status === "active" ? "ACTIVO" : "FINALIZADO"
    ]),
    styles: {
      fontSize: 9,
    },
    headStyles: {
      fillColor: [0, 51, 102],
    },
  });

  doc.save("reporte-parqueadero-UCE.pdf");
};

export default function ReportsPage() {
  const [stats, setStats] = useState({
    totalSessions: 0,
    activeNow: 0,
    mostUsedSlot: "-",
    avgTime: "0 min"
  });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const { data: sessions, error } = await supabase
        .from("parking_sessions")
        .select(`
          id,
          start_time,
          end_time,
          status,
          parking_slots ( number ),
          profiles ( full_name )
        `)
        .order('start_time', { ascending: false })
        .limit(50);

      if (error) throw error;
      setHistory(sessions || []);

      const { count: activeCount } = await supabase
        .from("parking_slots")
        .select('*', { count: 'exact', head: true })
        .eq('status', 'occupied');

      const { count: totalSessions } = await supabase
        .from("parking_sessions")
        .select('*', { count: 'exact', head: true });

      setStats({
        totalSessions: totalSessions || 0,
        activeNow: activeCount || 0,
        mostUsedSlot: sessions.length > 0 ? sessions[0].parking_slots?.number : "-",
        avgTime: "45 min" 
      });

    } catch (err) {
      console.error("Error en reportes:", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 p-22 max-w-[2200px] mx-auto">

      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-5xl font-black text-[#003366] uppercase italic leading-none">
            Análisis de Flujo
          </h1>
          <p className="text-sm font-bold text-gray-400 tracking-[0.3em] uppercase mt-3 text-center md:text-left">
            Estadísticas de uso del Parqueadero UCE
          </p>
        </div>

        <button
          onClick={() => exportToPDF(stats, history)}
          className="flex items-center gap-3 px-8 py-4 bg-white border-2 border-gray-100 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-all shadow-sm"
        >
          <Download size={20} /> Exportar PDF
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={<Users className="text-blue-600" size={30} />}
          label="Sesiones Totales"
          value={stats.totalSessions}
          subValue="+12% vs ayer"
          color="blue"
        />
        <StatCard 
          icon={<Car className="text-orange-600" size={30} />}
          label="Ocupación Actual"
          value={stats.activeNow}
          subValue="En tiempo real"
          color="orange"
        />
        <StatCard 
          icon={<Clock className="text-purple-600" size={30} />}
          label="Tiempo Promedio"
          value={stats.avgTime}
          subValue="Por usuario"
          color="purple"
        />
        <StatCard 
          icon={<BarChart3 className="text-green-600" size={30} />}
          label="Puesto Más Usado"
          value={`#${stats.mostUsedSlot}`}
          subValue="Alta rotación"
          color="green"
        />
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border-2 border-gray-50 overflow-hidden flex flex-col">
        <div className="p-10 border-b border-gray-50 flex justify-between items-center bg-gray-50/30 shrink-0">
          <h2 className="text-3xl font-black text-[#003366] uppercase italic flex items-center gap-4">
            <Clock size={28} /> Historial de Actividad Reciente
          </h2>
          <span className="text-xs font-black bg-blue-100 text-blue-600 px-6 py-2 rounded-full uppercase tracking-widest">
            Historial de registros
          </span>
        </div>

        <div className="overflow-y-auto max-h-[900px] custom-scrollbar">
          <table className="w-full">
            <thead className="sticky top-0 bg-white shadow-sm z-10">
              <tr className="border-b border-gray-100">
                <th className="px-10 py-6 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Usuario</th>
                <th className="px-10 py-6 text-center text-xs font-black text-gray-400 uppercase tracking-widest">Puesto</th>
                <th className="px-10 py-6 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Entrada</th>
                <th className="px-10 py-6 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Salida</th>
                <th className="px-10 py-6 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Estado</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-20 text-center">
                    <Loader2 className="animate-spin mx-auto text-[#003366]" size={40} />
                  </td>
                </tr>
              ) : history.length > 0 ? (
                history.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-10 py-8">
                      <p className="text-2xl font-black text-gray-800 uppercase italic leading-none">
                        {row.profiles?.full_name}
                      </p>
                      <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-wider">
                        ID: {row.id.split('-')[0]}
                      </p>
                    </td>

                    <td className="px-10 py-8">
                      <span className="w-14 h-14 bg-gray-100 flex items-center justify-center rounded-2xl font-black text-2xl text-[#003366] mx-auto shadow-inner border border-gray-200">
                        {row.parking_slots?.number}
                      </span>
                    </td>

                    <td className="px-10 py-8">
                      <div className="flex items-center gap-3 text-gray-600">
                        <ArrowUpRight size={18} className="text-green-500 stroke-[3px]" />
                        <span className="text-lg font-bold">
                          {new Date(row.start_time).toLocaleTimeString()}
                        </span>
                      </div>
                    </td>

                    <td className="px-10 py-8 text-lg font-bold text-gray-500">
                      {row.end_time ? (
                        <div className="flex items-center gap-3">
                          <ArrowDownLeft size={18} className="text-red-500 stroke-[3px]" />
                          <span>{new Date(row.end_time).toLocaleTimeString()}</span>
                        </div>
                      ) : (
                        <span className="italic text-blue-500 animate-pulse font-black text-base uppercase">
                          En curso...
                        </span>
                      )}
                    </td>

                    <td className="px-10 py-8">
                      <span className={`text-[10px] font-black px-5 py-2 rounded-full uppercase tracking-widest border-2 ${
                        row.status === 'active'
                          ? 'bg-blue-50 text-blue-600 border-blue-100'
                          : 'bg-gray-100 text-gray-500 border-gray-200'
                      }`}>
                        {row.status === 'active' ? 'ACTIVO' : 'FINALIZADO'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-20 text-center font-bold text-gray-400">
                    No hay registros hoy.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #003366;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #002244;
        }
      `}</style>
    </div>
  );
}

function StatCard({ icon, label, value, subValue, color }) {
  const colors = {
    blue: "border-blue-500 bg-blue-50/30",
    orange: "border-orange-500 bg-orange-50/30",
    purple: "border-purple-500 bg-purple-50/30",
    green: "border-green-500 bg-green-50/30"
  };

  return (
    <div className={`p-10 rounded-[2.5rem] border-l-8 bg-white shadow-sm border-t border-r border-b border-gray-100 ${colors[color]}`}>
      <div className="flex justify-between items-start mb-6">
        <div className="p-4 bg-white rounded-2xl shadow-sm border border-gray-50">
          {icon}
        </div>
      </div>
      <div>
        <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-2">{label}</p>
        <p className="text-5xl font-black text-[#003366] italic leading-none tracking-tighter">{value}</p>
        <p className="text-[10px] font-bold text-gray-500 mt-4 uppercase tracking-tighter">
          {subValue}
        </p>
      </div>
    </div>
  );
}