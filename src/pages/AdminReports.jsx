import { useEffect, useState, useMemo, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useSlots, useReleaseSlot } from '../hooks/useParking';
import { useQueryClient } from '@tanstack/react-query'; // Importante para limpiar caché
import {
  Car, Search, CheckCircle2, Loader2, LogOut,
  PieChart, Activity, AlertTriangle, FileText,
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function AdminReports() {
  const queryClient = useQueryClient();
  const { data: rawSlots = [], isLoading: loading } = useSlots();
  const { release, isFinishing } = useReleaseSlot();

  const [filter, setFilter] = useState('');
  const [enrichedData, setEnrichedData] = useState([]);

  const fetchEnrichedData = useCallback(async () => {
    if (!rawSlots || rawSlots.length === 0) return;

    try {
      const { data: profiles } = await supabase.from('profiles').select('id, full_name, role_id');
      const { data: vehicles } = await supabase.from('vehicles').select('user_id, license_plate, model');
      const { data: sessions } = await supabase.from('parking_sessions').select('*').eq('status', 'active');

      const enriched = rawSlots.map((slot) => {
        const profile = profiles?.find((p) => p.id === slot.user_id);
        const vehicle = vehicles?.find((v) => v.user_id === slot.user_id);
        const session = sessions?.find((s) => s.slot_id === slot.id);

        const ahora = new Date();
        const entrada = session ? new Date(session.start_time) : null;
        const horas = entrada ? (ahora - entrada) / (1000 * 60 * 60) : 0;

        const alertas = [];
        if (slot.status === 'occupied' && horas > 5) alertas.push('MÁXIMO EXCEDIDO (+5h)');
        else if (slot.status === 'occupied' && profile?.role_id === 'r001' && horas > 3) alertas.push('LÍMITE ESTUDIANTE (+3h)');
        if (slot.status === 'occupied' && !vehicle) alertas.push('NO REGISTRADO');

        return {
          ...slot,
          profiles: profile,
          vehicles: vehicle,
          alertasActivas: alertas,
          tiempoH: horas.toFixed(1),
        };
      });
      setEnrichedData(enriched);
    } catch (error) {
      console.error("Error al enriquecer datos:", error);
    }
  }, [rawSlots]);

  useEffect(() => {
    fetchEnrichedData();

    // REALTIME: Actualiza el monitor automáticamente ante cualquier cambio en BD
    const channel = supabase
      .channel('admin-monitor-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'parking_slots' }, () => fetchEnrichedData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'parking_sessions' }, () => fetchEnrichedData())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [rawSlots, fetchEnrichedData]);

  const handleAdminRelease = async (slotId, userId) => {
    if (!userId) return alert("No hay usuario asociado.");
    
    if (confirm('¿Estás seguro de liberar este espacio?')) {
      // 1. ACTUALIZACIÓN OPTIMISTA (Visual inmediata)
      setEnrichedData(prev => 
        prev.map(slot => 
          slot.id === slotId ? { ...slot, status: 'available', profiles: null, vehicles: null, alertasActivas: [] } : slot
        )
      );

      try {
        await release(slotId, userId);
        // 2. Limpiamos caché global para asegurar sincronización
        queryClient.invalidateQueries({ queryKey: ['slots'] });
        queryClient.invalidateQueries({ queryKey: ['activeSession', userId] });
      } catch (error) {
        console.error(error);
        fetchEnrichedData(); // Revertir si falla
      }
    }
  };

  const stats = useMemo(() => {
    const total = rawSlots.length;
    const occupied = enrichedData.filter((s) => s.status === 'occupied').length;
    return {
      total,
      occupied,
      available: total - occupied,
      rate: total > 0 ? Math.round((occupied / total) * 100) : 0,
      alertCount: enrichedData.filter((s) => s.alertasActivas?.length > 0).length,
    };
  }, [rawSlots.length, enrichedData]);

  const filteredSlots = useMemo(() => {
    const term = filter.toLowerCase().trim();
    if (!term) return enrichedData;
    return enrichedData.filter(
      (s) =>
        s.number.toString().includes(term) ||
        s.profiles?.full_name?.toLowerCase().includes(term) ||
        s.vehicles?.license_plate?.toLowerCase().includes(term)
    );
  }, [filter, enrichedData]);

  const handleGenerateReport = () => {
    const doc = new jsPDF();
    doc.text('REPORTE DE ESTADO - UCE SMART', 14, 20);
    const tableRows = filteredSlots.map((s) => [
      s.number, s.status.toUpperCase(), s.profiles?.full_name || 'N/A', s.vehicles?.license_plate || 'N/A',
    ]);
    autoTable(doc, { head: [['Puesto', 'Estado', 'Usuario', 'Placa']], body: tableRows, startY: 30 });
    doc.save('Reporte_Monitor.pdf');
  };

  if (loading && enrichedData.length === 0)
    return <div className="h-screen flex items-center justify-center font-black animate-pulse text-[#003366]">SINCRONIZANDO MONITOR...</div>;

  return (
    <div className="h-[calc(100vh-160px)] flex flex-col gap-8 overflow-hidden p-2">
      <div className="flex-none space-y-8">
        <div className="bg-white p-8 rounded-[3.5rem] shadow-md border-l-[18px] border-[#003366] flex flex-col lg:flex-row justify-between items-center gap-8">
          <div>
            <h1 className="text-5xl font-black text-[#003366] uppercase italic leading-none tracking-tighter">Monitor Maestro</h1>
            <p className="text-sm font-bold text-gray-400 mt-2 uppercase tracking-[0.3em]">Gestión UCE</p>
          </div>
          <div className="relative w-full max-w-xl">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="BUSCAR PUESTO, NOMBRE O PLACA..."
              className="w-full pl-16 pr-8 py-6 bg-gray-100 rounded-[2rem] font-black text-lg outline-none border-4 border-transparent focus:border-[#003366] transition-all"
            />
          </div>
          <button onClick={handleGenerateReport} className="flex gap-3 px-10 py-6 bg-green-600 text-white rounded-[2rem] font-black text-sm uppercase shadow-xl">
            <FileText size={24} /> Exportar
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard icon={<PieChart size={32} />} label="Ocupación" value={`${stats.rate}%`} color="blue" />
          <StatCard icon={<CheckCircle2 size={32} />} label="Libres" value={stats.available} color="green" />
          <StatCard icon={<Activity size={32} />} label="Total" value={stats.total} color="orange" />
          <StatCard icon={<AlertTriangle size={32} />} label="Alertas" value={stats.alertCount} color={stats.alertCount > 0 ? 'red' : 'gray'} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar-slots">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-12">
          {filteredSlots.map((slot) => {
            const isOccupied = slot.status === 'occupied';
            const tieneAlertas = slot.alertasActivas?.length > 0;

            return (
              <div key={slot.id} className={`p-8 rounded-[3.5rem] border-[5px] transition-all duration-300 ${tieneAlertas ? 'border-red-500 bg-red-50' : isOccupied ? 'bg-white border-blue-100 shadow-xl' : 'bg-gray-100/60 border-transparent opacity-70'}`}>
                <div className="flex justify-between items-start mb-6">
                  <div className={`w-20 h-20 rounded-[1.5rem] flex items-center justify-center text-4xl font-black ${isOccupied ? 'bg-[#003366] text-white' : 'bg-white text-gray-300 shadow-inner'}`}>{slot.number}</div>
                  <div className="flex flex-col gap-2 items-end">
                    {tieneAlertas ? slot.alertasActivas.map((a, i) => <span key={i} className="text-[10px] font-black px-4 py-2 bg-red-600 text-white rounded-lg">⚠️ {a}</span>) : <span className={`text-xs font-black px-5 py-2 rounded-full uppercase ${isOccupied ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{slot.status}</span>}
                  </div>
                </div>
                {isOccupied && (
                  <div className="space-y-5">
                    <p className="text-2xl font-black uppercase text-gray-800 leading-none truncate">{slot.profiles?.full_name || 'Usuario'}</p>
                    <div className="bg-[#003366] p-6 rounded-[2.5rem] text-white shadow-lg">
                      <p className="text-4xl font-black mb-4 tracking-tighter">{slot.vehicles?.license_plate || 'S/N'}</p>
                      <p className="text-xl font-black">{slot.tiempoH} <span className="text-xs italic">hrs</span></p>
                    </div>
                    <button onClick={() => handleAdminRelease(slot.id, slot.user_id)} disabled={isFinishing} className="w-full mt-4 py-4 bg-red-600 text-white rounded-[1.5rem] font-black uppercase text-sm hover:bg-red-800 flex items-center justify-center gap-2">
                      {isFinishing ? <Loader2 className="animate-spin" /> : <><LogOut size={20} /> Liberar</>}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  const colors = { blue: 'text-blue-600 bg-blue-50', green: 'text-green-600 bg-green-50', orange: 'text-orange-600 bg-orange-50', red: 'text-white bg-red-600 animate-pulse', gray: 'text-gray-400 bg-gray-100' };
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border-2 border-gray-50 shadow-sm flex items-center gap-6">
      <div className={`p-5 rounded-2xl ${colors[color]}`}>{icon}</div>
      <div>
        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-4xl font-black text-gray-800 leading-none">{value}</p>
      </div>
    </div>
  );
}