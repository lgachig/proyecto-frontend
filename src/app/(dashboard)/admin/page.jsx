"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { 
  ShieldCheck, Car, User as UserIcon, Clock, Search, 
  LogOut, RefreshCcw, CheckCircle2, AlertCircle 
} from "lucide-react";

export default function AdminGuardPanel() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  const fetchStatusGlobal = async () => {
    try {
      setLoading(true);
      // Consulta mejorada: Trae perfil y vehículo del usuario que ocupa el puesto
      const { data, error } = await supabase
        .from("parking_slots")
        .select(`
          id, number, status, user_id,
          profiles:user_id ( full_name ),
          vehicles:user_id ( license_plate, model, color )
        `)
        .order('number', { ascending: true });

      if (error) throw error;
      setSlots(data || []);
    } catch (err) {
      console.error("Error en monitor:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatusGlobal();
    // Suscripción en tiempo real: Actualiza si un usuario reserva desde el mapa
    const channel = supabase
      .channel('admin-monitor')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'parking_slots' }, () => {
        fetchStatusGlobal();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const forceRelease = async (slotId, userId) => {
    if (!confirm("¿Liberar este puesto manualmente?")) return;
    await supabase.from("parking_slots").update({ status: 'available', user_id: null }).eq("id", slotId);
    await supabase.from("parking_sessions").update({ end_time: new Date().toISOString(), status: 'completed' }).eq("user_id", userId).eq("status", "active");
    fetchStatusGlobal();
  };

  const occupiedCount = slots.filter(s => s.status === 'occupied').length;
  const filteredSlots = slots.filter(s => s.number.toString().includes(filter));

  if (loading) return <div className="h-screen flex items-center justify-center font-black text-[#003366]">CARGANDO TORRE DE CONTROL...</div>;

  return (
    <div className="space-y-8">
      {/* Resumen de Ocupación */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm flex items-center justify-between border-b-8 border-[#003366]">
          <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Ocupación Actual</p>
            <p className="text-4xl font-black text-[#003366]">{occupiedCount} / {slots.length}</p>
          </div>
          <Car size={40} className="text-gray-100" />
        </div>
      </div>

      {/* Buscador de Puestos */}
      <div className="relative">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input 
          type="text" 
          placeholder="BUSCAR POR NÚMERO DE PUESTO..."
          className="w-full pl-14 pr-6 py-6 rounded-3xl border-none shadow-sm font-bold uppercase text-sm focus:ring-4 focus:ring-[#003366]/10 transition-all"
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      {/* Monitor de Slots */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredSlots.map((slot) => (
          <div key={slot.id} className={`p-8 rounded-[3rem] shadow-sm border-2 transition-all ${
            slot.status === 'occupied' ? 'bg-white border-[#003366]/10' : 'bg-gray-50/50 border-transparent opacity-60'
          }`}>
            <div className="flex justify-between items-center mb-6">
              <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-black ${
                slot.status === 'occupied' ? 'bg-[#003366] text-white shadow-xl' : 'bg-white text-gray-300'
              }`}>
                <span className="text-[10px] opacity-60">Nº</span>
                <span className="text-3xl">{slot.number}</span>
              </div>
              <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase ${
                slot.status === 'occupied' ? 'bg-red-100 text-[#CC0000]' : 'bg-green-100 text-green-700'
              }`}>
                {slot.status === 'occupied' ? 'OCUPADO' : 'LIBRE'}
              </span>
            </div>

            {slot.status === 'occupied' ? (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Usuario</p>
                  <p className="font-black text-[#003366] italic uppercase">{slot.profiles?.full_name || "Anonimo"}</p>
                </div>
                <div className="p-4 bg-[#003366] text-white rounded-2xl shadow-lg shadow-blue-900/20">
                  <p className="text-[10px] font-black opacity-60 uppercase mb-1">Vehículo / Placa</p>
                  <p className="font-black text-lg tracking-tighter uppercase">
                    {slot.vehicles?.license_plate || "SIN PLACA"} - {slot.vehicles?.model}
                  </p>
                </div>
                <button 
                  onClick={() => forceRelease(slot.id, slot.user_id)}
                  className="w-full py-4 bg-[#CC0000] text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:brightness-110 transition-all"
                >
                  Liberar Manualmente
                </button>
              </div>
            ) : (
              <div className="py-12 text-center text-gray-200 uppercase font-black italic text-xs">
                Esperando ingreso...
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}