"use client";
import { useEffect, useState, useRef } from "react";
import { supabase } from "../../../lib/supabase";
// Importaciones de Gráficas (RECHARTS)
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area, Legend
} from "recharts";
// Importaciones de Iconos (LUCIDE)
import { 
  Calendar, Clock, Users, Car, Download, 
  History, Flame, TrendingUp, ArrowUpRight, ArrowDownLeft, Loader2,
  BarChart3 
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";

export default function UnifiedAdminReports() {
  const [dataReport, setDataReport] = useState({ 
    dayCounts: [], 
    hourCounts: [], 
    roleCounts: [],
    topUsers: [] 
  });
  const [stats, setStats] = useState({
    totalSessions: 0,
    activeNow: 0,
    mostUsedSlot: "-",
    avgTime: "45 min"
  });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const chartSectionRef = useRef();

  useEffect(() => { fetchEverything(); }, []);

  const fetchEverything = async () => {
    try {
      setLoading(true);
      const { data: sessions, error } = await supabase
        .from("parking_sessions")
        .select(`
          id, start_time, end_time, status,
          parking_slots ( number ),
          profiles:user_id ( full_name, role_id )
        `)
        .order('start_time', { ascending: false });

      if (error) throw error;
      const { data: profiles } = await supabase.from("profiles").select("role_id");

      setHistory(sessions || []);
      processAnalytics(sessions || [], profiles || []);

      const { count: activeCount } = await supabase
        .from("parking_slots")
        .select('*', { count: 'exact', head: true })
        .eq('status', 'occupied');

      setStats(prev => ({
        ...prev,
        totalSessions: sessions.length,
        activeNow: activeCount || 0,
        mostUsedSlot: sessions.length > 0 ? sessions[0].parking_slots?.number : "-",
      }));
    } catch (err) {
      console.error("Error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const processAnalytics = (sessions, profiles) => {
    const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    const dayCounts = days.map(day => ({ name: day, visitas: 0 }));
    const hourCounts = Array.from({ length: 15 }, (_, i) => ({ hora: `${i + 7}:00`, cantidad: 0 }));
    const userMap = {};

    sessions.forEach(s => {
      const date = new Date(s.start_time);
      dayCounts[date.getDay()].visitas++;
      const hour = date.getHours();
      if (hour >= 7 && hour <= 21) hourCounts[hour - 7].cantidad++;
      const userName = s.profiles?.full_name || "Usuario General";
      userMap[userName] = (userMap[userName] || 0) + 1;
    });

    const topUsers = Object.entries(userMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value).slice(0, 5);

    const rolesMap = { 'r001': 'Estudiantes', 'r002': 'Docentes', 'r003': 'Administrativos' };
    const roleStats = profiles.reduce((acc, curr) => {
      const name = rolesMap[curr.role_id] || 'Otros';
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {});

    setDataReport({ 
      dayCounts, 
      hourCounts, 
      roleCounts: Object.entries(roleStats).map(([name, value]) => ({ name, value })),
      topUsers 
    });
  };

  const exportChartsToPDF = async () => {
    const canvas = await html2canvas(chartSectionRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("analisis-grafico-uce.pdf");
  };

  const COLORS = ['#003366', '#f97316', '#10b981', '#6366f1'];

  if (loading) return <div className="h-screen flex items-center justify-center font-black text-2xl animate-pulse text-[#003366]">SINCRONIZANDO...</div>;

  return (
    <div className="p-8 space-y-12 bg-gray-50 min-h-screen">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h1 className="text-6xl font-black text-[#003366] italic uppercase leading-none tracking-tighter">Análisis de Flujo</h1>
          <p className="text-xl font-bold text-gray-400 tracking-[0.3em] uppercase mt-3 text-center md:text-left">UCE SMART DASHBOARD</p>
        </div>
        <button onClick={exportChartsToPDF} className="flex items-center gap-3 px-8 py-5 bg-[#003366] text-white rounded-[2rem] font-black text-sm uppercase hover:bg-blue-900 shadow-2xl transition-all">
          <Download size={22} /> Exportar Reporte Gráfico
        </button>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <BigStatCard icon={<Users size={40}/>} label="Sesiones Totales" value={stats.totalSessions} color="blue" />
        <BigStatCard icon={<Car size={40}/>} label="Ocupación Actual" value={stats.activeNow} color="orange" />
        <BigStatCard icon={<Clock size={40}/>} label="Tiempo Promedio" value={stats.avgTime} color="purple" />
        <BigStatCard icon={<BarChart3 size={40}/>} label="Puesto Más Usado" value={`#${stats.mostUsedSlot}`} color="green" />
      </div>

      {/* GRÁFICAS RECUERADAS */}
      <div ref={chartSectionRef} className="space-y-12 bg-gray-50 p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="bg-white p-10 rounded-[4rem] shadow-sm border border-gray-100 flex flex-col items-center">
            <h2 className="text-2xl font-black text-gray-800 uppercase mb-8 italic">Composición</h2>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={dataReport.roleCounts} innerRadius={70} outerRadius={100} paddingAngle={8} dataKey="value">
                    {dataReport.roleCounts.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{fontSize: "16px", fontWeight: "bold"}} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white p-10 rounded-[4rem] shadow-sm border border-gray-100">
            <h2 className="text-2xl font-black text-gray-800 uppercase mb-8 flex items-center gap-4 italic"><History size={30} className="text-blue-600" /> Top Reincidencia</h2>
            <div className="space-y-4">
              {dataReport.topUsers.map((user, i) => (
                <div key={i} className="flex items-center justify-between p-6 bg-gray-50 rounded-[2.5rem] border-l-[12px] border-[#003366]">
                  <p className="text-2xl font-black text-[#003366] uppercase truncate">{user.name}</p>
                  <p className="text-3xl font-black text-blue-600">{user.value} <span className="text-sm text-gray-400 font-bold">USOS</span></p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* MAPA DE CALOR */}
        <div className="bg-white p-12 rounded-[4rem] shadow-sm border border-gray-100">
          <h2 className="text-2xl font-black text-gray-800 uppercase mb-10 flex items-center gap-4 italic"><Flame size={32} className="text-orange-500" /> Saturación por Hora</h2>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dataReport.hourCounts}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="hora" tick={{fontSize: 14, fontWeight: 'bold'}} />
                <Tooltip />
                <Area type="monotone" dataKey="cantidad" stroke="#f97316" strokeWidth={6} fill="#f97316" fillOpacity={0.1} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GRÁFICA SEMANAL RECUPERADA */}
        <div className="bg-white p-12 rounded-[4rem] shadow-sm border border-gray-100">
          <h2 className="text-2xl font-black text-[#003366] uppercase mb-10 flex items-center gap-4 italic"><TrendingUp size={32} /> Tendencia Semanal</h2>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataReport.dayCounts}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="name" tick={{fontSize: 16, fontWeight: 'black'}} axisLine={false} />
                <Tooltip cursor={{fill: '#f8fafc'}} />
                <Bar dataKey="visitas" fill="#003366" radius={[20, 20, 0, 0]} barSize={80} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* TABLA CON SCROLL INTERNO */}
      <div className="bg-white rounded-[4rem] shadow-2xl border-2 border-gray-100 overflow-hidden flex flex-col h-[800px]">
        <div className="p-12 border-b border-gray-100 bg-gray-50 flex justify-between items-center shrink-0">
          <h2 className="text-4xl font-black text-[#003366] uppercase italic flex items-center gap-6"><Clock size={40} /> Historial de Sesiones</h2>
          <span className="bg-blue-600 text-white px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest">Tiempo Real</span>
        </div>
        
        <div className="overflow-y-auto flex-grow custom-scrollbar">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 bg-white z-10 shadow-sm">
              <tr className="border-b-2 border-gray-100">
                <th className="px-10 py-8 text-left text-sm font-black text-gray-400 uppercase tracking-widest">Usuario</th>
                <th className="px-10 py-8 text-center text-sm font-black text-gray-400 uppercase tracking-widest">Puesto</th>
                <th className="px-10 py-8 text-left text-sm font-black text-gray-400 uppercase tracking-widest">Entrada / Salida</th>
                <th className="px-10 py-8 text-left text-sm font-black text-gray-400 uppercase tracking-widest">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {history.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-10 py-10">
                    <p className="text-3xl font-black text-gray-800 uppercase italic leading-none">{row.profiles?.full_name}</p>
                    <p className="text-[10px] font-bold text-gray-400 mt-3 tracking-widest">SESIÓN: {row.id.split('-')[0]}</p>
                  </td>
                  <td className="px-10 py-10 text-center">
                    <span className="w-20 h-20 bg-gray-100 flex items-center justify-center rounded-[2rem] font-black text-4xl text-[#003366] mx-auto border-2 border-gray-200 shadow-inner">
                      {row.parking_slots?.number}
                    </span>
                  </td>
                  <td className="px-10 py-10">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-green-600 font-black text-xl italic"><ArrowUpRight size={24} strokeWidth={4} /> {new Date(row.start_time).toLocaleTimeString()}</div>
                      {row.end_time ? (
                        <div className="flex items-center gap-3 text-red-500 font-black text-xl italic"><ArrowDownLeft size={24} strokeWidth={4} /> {new Date(row.end_time).toLocaleTimeString()}</div>
                      ) : (
                        <div className="text-blue-500 animate-pulse font-black text-sm uppercase tracking-tighter ml-9">● Activo ahora</div>
                      )}
                    </div>
                  </td>
                  <td className="px-10 py-10">
                    <span className={`text-[10px] font-black px-8 py-3 rounded-full uppercase border-2 ${
                      row.status === 'active' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-gray-100 text-gray-400 border-gray-200'
                    }`}>
                      {row.status === 'active' ? 'OCUPADO' : 'LIBERADO'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 12px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f8fafc; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #003366; border-radius: 20px; border: 3px solid #f8fafc; }
      `}</style>
    </div>
  );
}

function BigStatCard({ icon, label, value, color }) {
  const colors = {
    blue: "border-blue-500 text-blue-600",
    orange: "border-orange-500 text-orange-600",
    purple: "border-purple-500 text-purple-600",
    green: "border-green-500 text-green-600"
  };
  return (
    <div className={`bg-white p-10 rounded-[3.5rem] border-l-[14px] shadow-sm border border-gray-100 ${colors[color]} hover:scale-105 transition-transform`}>
      <div className="mb-6 opacity-80 bg-gray-50 w-fit p-4 rounded-2xl">{icon}</div>
      <p className="text-sm font-black text-gray-400 uppercase tracking-widest mb-2">{label}</p>
      <p className="text-6xl font-black text-[#003366] italic leading-none">{value}</p>
    </div>
  );
}