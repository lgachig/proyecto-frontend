import { useEffect, useState, useRef, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, Legend,
} from 'recharts';
import {
  Calendar, Clock, Users, Car, Download,
  History, Flame, TrendingUp, ArrowUpRight, ArrowDownLeft, 
  XCircle, FileText, Filter, LayoutDashboard
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function AdminDashboard() {
  const [allSessions, setAllSessions] = useState([]);
  const [allProfiles, setAllProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    startHour: '07:00',
    endHour: '22:00'
  });

  const chartSectionRef = useRef();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: sessions, error: sErr } = await supabase
        .from('parking_sessions')
        .select(`
          id, start_time, end_time, status,
          parking_slots ( number ),
          profiles:user_id ( full_name, role_id )
        `)
        .order('start_time', { ascending: false });

      if (sErr) throw sErr;
      const { data: profiles, error: pErr } = await supabase.from('profiles').select('role_id');
      if (pErr) throw pErr;

      setAllSessions(sessions || []);
      setAllProfiles(profiles || []);
    } catch (err) {
      console.error('Error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const analytics = useMemo(() => {
    if (!allSessions.length) return {
      filteredSessions: [],
      dataReport: { dayCounts: [], hourCounts: [], roleCounts: [], topUsers: [] },
      stats: { totalSessions: 0, activeNow: 0, mostUsedSlot: '-', avgTime: '0 min' }
    };

    const filtered = allSessions.filter(s => {
      const date = new Date(s.start_time);
      const sessionDateStr = date.toISOString().split('T')[0];
      const sessionHour = date.getHours();
      const matchDate = (!filters.startDate || sessionDateStr >= filters.startDate) &&
                        (!filters.endDate || sessionDateStr <= filters.endDate);
      const hStart = parseInt(filters.startHour.split(':')[0]);
      const hEnd = parseInt(filters.endHour.split(':')[0]);
      return matchDate && (sessionHour >= hStart && sessionHour <= hEnd);
    });

    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const dayCounts = days.map(day => ({ name: day, visitas: 0 }));
    const hourCounts = Array.from({ length: 15 }, (_, i) => ({ hora: `${i + 7}:00`, cantidad: 0 }));
    const userMap = {};
    let activeNow = 0;

    filtered.forEach(s => {
      const date = new Date(s.start_time);
      dayCounts[date.getDay()].visitas++;
      const hour = date.getHours();
      if (hour >= 7 && hour <= 21) hourCounts[hour - 7].cantidad++;
      const userName = s.profiles?.full_name || 'Anónimo';
      userMap[userName] = (userMap[userName] || 0) + 1;
      if (s.status === 'active') activeNow++;
    });

    const topUsers = Object.entries(userMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value).slice(0, 5);

    const rolesMap = { r001: 'Estudiantes', r002: 'Docentes', r003: 'Administrativos' };
    const roleStats = allProfiles.reduce((acc, curr) => {
      const name = rolesMap[curr.role_id] || 'Otros';
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {});

    return {
      filteredSessions: filtered,
      dataReport: {
        dayCounts,
        hourCounts,
        roleCounts: Object.entries(roleStats).map(([name, value]) => ({ name, value })),
        topUsers,
      },
      stats: {
        totalSessions: filtered.length,
        activeNow,
        mostUsedSlot: filtered.length > 0 ? (filtered[0].parking_slots?.number || '-') : '-',
        avgTime: '45 min'
      }
    };
  }, [allSessions, allProfiles, filters]);

  const exportChartsToPDF = async () => {
    const element = chartSectionRef.current;
    if (!element) return;
    try {
      const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#f3f4f6' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.setFontSize(18);
      pdf.text('REPORTE UCE SMART PARKING', 15, 20);
      pdf.addImage(imgData, 'PNG', 0, 30, pdfWidth, pdfHeight);
      pdf.save(`reporte-analitico-uce.pdf`);
    } catch (err) {
      alert('Error al generar PDF.');
    }
  };

  const COLORS = ['#003366', '#CC0000', '#10b981', '#f59e0b'];

  if (loading) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50">
      <div className="w-16 h-16 border-4 border-[#003366] border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 font-bold text-[#003366] animate-pulse">CARGANDO DATOS...</p>
    </div>
  );

  return (
    <div className="p-4 md:p-8 space-y-8 bg-[#f8fafc] min-h-screen font-sans">
      
      {/* HEADER PRINCIPAL */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 text-[#003366] rounded-lg">
              <LayoutDashboard size={24} />
            </div>
            <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Administración</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
            Dashboard General
          </h1>
        </div>

        {/* BARRA DE FILTROS MODERNA */}
        <div className="w-full xl:w-auto bg-white p-2 pr-3 rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 flex flex-col md:flex-row gap-2 items-center">
          <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 w-full md:w-auto transition-colors focus-within:bg-white focus-within:border-blue-200 focus-within:ring-2 focus-within:ring-blue-100">
            <Filter size={18} className="text-gray-400" />
            <input 
              type="date" 
              className="bg-transparent text-sm font-bold text-gray-600 focus:outline-none w-full md:w-auto" 
              value={filters.startDate} 
              onChange={(e) => setFilters({...filters, startDate: e.target.value})} 
            />
            <span className="text-gray-300 font-light px-1">|</span>
            <input 
              type="date" 
              className="bg-transparent text-sm font-bold text-gray-600 focus:outline-none w-full md:w-auto" 
              value={filters.endDate} 
              onChange={(e) => setFilters({...filters, endDate: e.target.value})} 
            />
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <button 
              onClick={() => setFilters({startDate:'', endDate:'', startHour:'07:00', endHour:'22:00'})} 
              className="p-3 bg-gray-100 text-gray-400 rounded-xl hover:bg-red-50 hover:text-red-500 transition-all active:scale-95"
              title="Limpiar filtros"
            >
              <XCircle size={20} />
            </button>
            <button 
              onClick={exportChartsToPDF} 
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-[#003366] hover:bg-[#002244] text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-900/20 active:scale-95 transition-all"
            >
              <Download size={18} /> <span>Reporte PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI CARDS (DISEÑO FLOTANTE) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={<Users size={24} />} 
          label="Total Sesiones" 
          value={analytics.stats.totalSessions} 
          trend="+12%" // Placeholder para futuro
          color="blue" 
        />
        <StatCard 
          icon={<Car size={24} />} 
          label="En uso ahora" 
          value={analytics.stats.activeNow} 
          trend="En vivo"
          color="green" 
        />
        <StatCard 
          icon={<Clock size={24} />} 
          label="Tiempo Promedio" 
          value={analytics.stats.avgTime} 
          trend="Estable"
          color="purple" 
        />
        <StatCard 
          icon={<TrendingUp size={24} />} 
          label="Puesto Top" 
          value={`#${analytics.stats.mostUsedSlot}`} 
          trend="Popular"
          color="orange" 
        />
      </div>

      <div ref={chartSectionRef} className="space-y-8 animate-in slide-in-from-bottom-8 duration-700 delay-100">
        
        {/* GRÁFICAS PRINCIPALES */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          
          {/* ROLES (DONUT CHART) */}
          <div className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-200/40 border border-gray-100 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-black text-gray-800 mb-2">Usuarios</h3>
              <p className="text-sm text-gray-400 font-medium mb-6">Distribución por tipo de rol</p>
            </div>
            <div className="h-[280px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={analytics.dataReport.roleCounts} 
                    innerRadius={70} 
                    outerRadius={90} 
                    paddingAngle={6} 
                    dataKey="value"
                    cornerRadius={8}
                  >
                    {analytics.dataReport.roleCounts.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.2)'}} 
                    itemStyle={{fontWeight: 'bold', color: '#1f2937'}}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle"/>
                </PieChart>
              </ResponsiveContainer>
              {/* Centro del Donut */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <div className="text-center">
                    <span className="block text-3xl font-black text-gray-800">{analytics.stats.totalSessions}</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Total</span>
                 </div>
              </div>
            </div>
          </div>

          {/* TOP USUARIOS (LISTA MODERNA) */}
          <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-xl shadow-gray-200/40 border border-gray-100">
            <div className="flex items-center justify-between mb-8">
               <div>
                  <h3 className="text-xl font-black text-gray-800 mb-1">Top Usuarios</h3>
                  <p className="text-sm text-gray-400 font-medium">Quienes más utilizan el parqueadero</p>
               </div>
               <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                  <History size={24} />
               </div>
            </div>

            <div className="space-y-4">
              {analytics.dataReport.topUsers.length > 0 ? (
                analytics.dataReport.topUsers.map((user, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-gray-50 hover:bg-blue-50/50 rounded-2xl transition-all duration-300 group border border-transparent hover:border-blue-100">
                    <div className="flex items-center gap-4">
                      <span className={`w-10 h-10 flex items-center justify-center rounded-xl font-black text-sm shadow-sm ${
                        i === 0 ? 'bg-yellow-400 text-yellow-900' : 
                        i === 1 ? 'bg-gray-300 text-gray-800' : 
                        i === 2 ? 'bg-orange-300 text-orange-900' : 'bg-white text-gray-500 border border-gray-200'
                      }`}>
                        {i + 1}
                      </span>
                      <div>
                        <p className="font-bold text-gray-700 group-hover:text-blue-700 transition-colors uppercase text-sm">{user.name}</p>
                        <div className="h-1.5 w-24 bg-gray-200 rounded-full mt-2 overflow-hidden">
                           <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(100, (user.value / (analytics.dataReport.topUsers[0].value || 1)) * 100)}%` }}></div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-gray-800 group-hover:text-blue-600">{user.value}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Visitas</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400 opacity-50">
                  <FileText size={48} className="mb-2" />
                  <p className="italic">Sin datos suficientes</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ACTIVIDAD POR HORA (ÁREA CON GRADIENTE) */}
        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-200/40 border border-gray-100">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
               <h3 className="text-xl font-black text-gray-800 mb-1 flex items-center gap-2">
                  <Flame size={20} className="text-orange-500" /> Saturación
               </h3>
               <p className="text-sm text-gray-400 font-medium">Actividad promedio por hora del día</p>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.dataReport.hourCounts} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVisitas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="hora" tick={{fontSize: 12, fill: '#94a3b8', fontWeight: 700}} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{fontSize: 12, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.2)'}}
                  cursor={{stroke: '#f97316', strokeWidth: 2, strokeDasharray: '5 5'}}
                />
                <Area type="monotone" dataKey="cantidad" stroke="#f97316" strokeWidth={4} fill="url(#colorVisitas)" activeDot={{ r: 6, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* TENDENCIA SEMANAL (BARRAS REDONDEADAS) */}
        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-200/40 border border-gray-100">
          <h3 className="text-xl font-black text-gray-800 mb-8 flex items-center gap-2">
            <Calendar size={20} className="text-blue-600" /> Flujo Semanal
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.dataReport.dayCounts} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{fontSize: 12, fill: '#94a3b8', fontWeight: 700}} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{fontSize: 12, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{fill: '#f8fafc', radius: 12}} 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.2)'}}
                />
                <Bar dataKey="visitas" fill="#003366" radius={[12, 12, 12, 12]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* HISTORIAL (TABLA MODERNA PERO LIMPIA) */}
      <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/40 border border-gray-100 overflow-hidden flex flex-col h-[600px] animate-in slide-in-from-bottom-8 duration-700 delay-200">
        <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center bg-white sticky top-0 z-20">
          <div>
            <h3 className="text-xl font-black text-gray-800 flex items-center gap-3">
              <FileText size={22} className="text-[#CC0000]" /> Bitácora de Actividad
            </h3>
            <p className="text-sm text-gray-400 font-medium mt-1">Registro detallado de entradas y salidas</p>
          </div>
          <span className="mt-4 md:mt-0 bg-gray-100 text-gray-600 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border border-gray-200">
            {analytics.filteredSessions.length} Registros
          </span>
        </div>

        <div className="overflow-auto flex-grow custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-gray-50/95 backdrop-blur-sm z-10 text-xs uppercase text-gray-500 font-bold tracking-wider border-b border-gray-200">
              <tr>
                <th className="px-8 py-5">Usuario</th>
                <th className="px-8 py-5 text-center">Puesto</th>
                <th className="px-8 py-5">Entrada</th>
                <th className="px-8 py-5">Salida</th>
                <th className="px-8 py-5 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {analytics.filteredSessions.length > 0 ? (
                analytics.filteredSessions.map((row) => (
                  <tr key={row.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-8 py-5">
                      <p className="font-bold text-gray-800 group-hover:text-[#003366] transition-colors">{row.profiles?.full_name || 'Desconocido'}</p>
                      <p className="text-[10px] text-gray-400 font-mono mt-0.5">ID: {row.id.substring(0,6)}...</p>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <div className="inline-flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg font-black text-[#003366] group-hover:bg-white group-hover:shadow-md transition-all border border-transparent group-hover:border-gray-200">
                        {row.parking_slots?.number}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-gray-500 font-medium">
                      <div className="flex items-center gap-2">
                        <ArrowUpRight size={14} className="text-green-500" />
                        {new Date(row.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-gray-500 font-medium">
                      {row.end_time ? (
                        <div className="flex items-center gap-2">
                           <ArrowDownLeft size={14} className="text-red-500" />
                           {new Date(row.end_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                      ) : (
                        <span className="text-blue-500 font-bold text-xs uppercase tracking-wide animate-pulse">En curso</span>
                      )}
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className={`inline-block px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wide border ${
                        row.status === 'active' 
                          ? 'bg-blue-50 text-blue-600 border-blue-200 shadow-sm' 
                          : 'bg-gray-50 text-gray-500 border-gray-200'
                      }`}>
                        {row.status === 'active' ? 'Activo' : 'Finalizado'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center text-gray-400 flex flex-col items-center justify-center">
                    <Filter size={32} className="mb-2 opacity-50" />
                    <p>No se encontraron sesiones con los filtros actuales.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Componente StatCard Moderno
function StatCard({ icon, label, value, color, trend }) {
  const themes = {
    blue:   { bgIcon: 'bg-blue-50', textIcon: 'text-blue-600', hoverBorder: 'group-hover:border-blue-200' },
    green:  { bgIcon: 'bg-emerald-50', textIcon: 'text-emerald-600', hoverBorder: 'group-hover:border-emerald-200' },
    purple: { bgIcon: 'bg-purple-50', textIcon: 'text-purple-600', hoverBorder: 'group-hover:border-purple-200' },
    orange: { bgIcon: 'bg-orange-50', textIcon: 'text-orange-600', hoverBorder: 'group-hover:border-orange-200' },
  };
  
  const theme = themes[color];

  return (
    <div className={`p-6 bg-white rounded-3xl shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-1 group ${theme.hoverBorder}`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${theme.bgIcon} ${theme.textIcon} transition-transform group-hover:scale-110`}>
          {icon}
        </div>
        {trend && (
          <span className="px-2 py-1 bg-gray-50 text-gray-500 text-[10px] font-bold uppercase rounded-lg border border-gray-100">
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-3xl font-black text-gray-800 tracking-tight">{value}</p>
      </div>
    </div>
  );
}