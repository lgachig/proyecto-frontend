"use client";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "../../../lib/supabase";
import { 
  Car, User as UserIcon, Search, 
  RefreshCcw, CheckCircle2, Loader2 
} from "lucide-react";

export default function AdminGuardPanel() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  const fetchStatusGlobal = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("parking_slots")
        .select(`
          id, 
          number, 
          status, 
          user_id,
          profiles ( 
            full_name 
          )
        `)
        .order('number', { ascending: true });

      if (error) throw error;

      const occupiedUserIds = data.filter(s => s.user_id).map(s => s.user_id);
      
      let vehiclesData = [];
      if (occupiedUserIds.length > 0) {
        const { data: vData } = await supabase
          .from('vehicles')
          .select('user_id, license_plate, model')
          .in('user_id', occupiedUserIds);
        vehiclesData = vData || [];
      }

      const combinedData = data.map(slot => ({
        ...slot,
        vehicle: vehiclesData.find(v => v.user_id === slot.user_id)
      }));

      setSlots(combinedData);
    } catch (err) {
      console.error("Error en monitor:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredSlots = useMemo(() => {
    const searchTerm = filter.toLowerCase().trim();
    if (!searchTerm) return slots;

    return slots.filter(slot => {
      const matchNumber = slot.number.toString().includes(searchTerm);
      const matchUser = slot.profiles?.full_name?.toLowerCase().includes(searchTerm);
      const matchPlate = slot.vehicle?.license_plate?.toLowerCase().includes(searchTerm);
      
      return matchNumber || matchUser || matchPlate;
    });
  }, [filter, slots]);

  useEffect(() => {
    fetchStatusGlobal();
    const channel = supabase
      .channel('admin-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'parking_slots' }, () => {
        fetchStatusGlobal();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const forceRelease = async (slotId, userId) => {
    if (!confirm("¿Desea liberar este puesto manualmente?")) return;
    try {
      await supabase.from('parking_slots').update({ status: 'available', user_id: null }).eq('id', slotId);
      if (userId) {
        await supabase.from('parking_sessions').update({ end_time: new Date().toISOString(), status: 'completed' })
          .eq('user_id', userId).eq('status', 'active');
      }
      fetchStatusGlobal();
    } catch (err) {
      alert("Error al liberar");
    }
  };

  return (
    <div className="space-y-8 p-20 mx-auto">
      {/* HEADER AJUSTADO */}
      <div className="bg-white p-8 rounded-[3rem] shadow-sm border-l-[14px] border-[#003366] flex flex-col lg:flex-row justify-between items-center gap-6">
        <div className="w-full lg:w-auto">
          <h1 className="text-4xl font-black text-[#003366] uppercase italic leading-none">Monitor Maestro</h1>
          <p className="text-xs font-bold text-gray-400 tracking-[0.3em] uppercase mt-2">Control de Accesos UCE</p>
        </div>

        <div className="relative w-full max-w-xl">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
          <input 
            type="text"
            placeholder="BUSCAR PUESTO, NOMBRE O PLACA..."
            className="w-full pl-14 pr-6 py-5 bg-gray-100 rounded-[1.5rem] font-bold text-lg outline-none focus:ring-4 ring-blue-900/10 transition-all border-2 border-transparent focus:border-[#003366]"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>

        <button onClick={fetchStatusGlobal} className="p-5 bg-[#003366] text-white rounded-2xl hover:scale-105 transition-transform">
          <RefreshCcw size={28} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* GRID CON CUADROS MÁS GRANDES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
        {filteredSlots.map((slot) => (
          <div key={slot.id} className={`p-8 rounded-[2.5rem] border-4 transition-all duration-300 ${
            slot.status === 'occupied' ? 'bg-white border-blue-100 shadow-xl' : 'bg-gray-100/40 border-transparent opacity-70'
          }`}>
            <div className="flex justify-between items-center mb-6">
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-4xl font-black shadow-md ${
                slot.status === 'occupied' ? 'bg-[#003366] text-white' : 'bg-white text-gray-300'
              }`}>
                {slot.number}
              </div>
              <span className={`text-[10px] font-black px-5 py-2 rounded-full uppercase tracking-[0.2em] border-2 ${
                slot.status === 'occupied' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'
              }`}>
                {slot.status === 'occupied' ? 'Ocupado' : 'Libre'}
              </span>
            </div>

            {slot.status === 'occupied' ? (
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <UserIcon size={20} className="text-gray-400 shrink-0" />
                  <p className="text-xl font-black uppercase text-gray-800 italic truncate">
                    {slot.profiles?.full_name || "Desconocido"}
                  </p>
                </div>
                
                <div className="bg-[#003366] p-5 rounded-[2rem] text-white shadow-lg">
                  <div className="flex items-center gap-2 mb-1 opacity-60">
                    <Car size={16} />
                    <span className="text-[10px] font-bold uppercase">Vehículo</span>
                  </div>
                  <p className="text-3xl font-black uppercase tracking-tight leading-none">{slot.vehicle?.license_plate || "S/PLACA"}</p>
                  <p className="text-sm font-bold opacity-80 uppercase italic mt-1">{slot.vehicle?.model || "Usuario UCE"}</p>
                </div>

                <button 
                  onClick={() => forceRelease(slot.id, slot.user_id)}
                  className="w-full py-5 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all border-2 border-red-100"
                >
                  Liberar Puesto
                </button>
              </div>
            ) : (
              <div className="py-16 text-center flex flex-col items-center justify-center gap-4">
                <CheckCircle2 size={48} className="text-gray-200" />
                <p className="text-xs font-black text-gray-300 uppercase tracking-widest italic">Puesto Disponible</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}