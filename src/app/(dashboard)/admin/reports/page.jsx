"use client";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "../../../../lib/supabase";
import { 
  Car, User as UserIcon, Search, 
  RefreshCcw, CheckCircle2, Loader2, LogOut 
} from "lucide-react";

export default function AdminGuardPanel() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("parking_slots")
        .select(`
          id, number, status, user_id,
          profiles:user_id ( full_name ),
          vehicles:user_id ( license_plate, model )
        `)
        .order('number', { ascending: true });

      if (error) {
        const { data: simpleData } = await supabase
          .from("parking_slots")
          .select('*')
          .order('number', { ascending: true });

        const enrichedSlots = await Promise.all((simpleData || []).map(async (slot) => {
          if (slot.user_id) {
            const { data: p } = await supabase.from('profiles').select('full_name').eq('id', slot.user_id).single();
            const { data: v } = await supabase.from('vehicles').select('license_plate, model').eq('user_id', slot.user_id).single();
            return { ...slot, profiles: p, vehicles: v };
          }
          return slot;
        }));
        setSlots(enrichedSlots);
      } else {
        setSlots(data || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();

    const channel = supabase
      .channel('admin-realtime-v2')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'parking_slots' },
        () => fetchInitialData()
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const filteredSlots = useMemo(() => {
    const term = filter.toLowerCase().trim();
    if (!term) return slots;
    return slots.filter(s => 
      s.number.toString().includes(term) ||
      s.profiles?.full_name?.toLowerCase().includes(term) ||
      s.vehicles?.license_plate?.toLowerCase().includes(term)
    );
  }, [filter, slots]);

  const forceRelease = async (slotId, userId) => {
    if (!confirm("¿Liberar puesto manualmente?")) return;
    await supabase.from('parking_slots').update({ status: 'available', user_id: null }).eq('id', slotId);
    if (userId) {
      await supabase.from('parking_sessions')
        .update({ end_time: new Date().toISOString(), status: 'completed' })
        .eq('user_id', userId)
        .eq('status', 'active');
    }
  };

  return (
    <div className="p-6 max-w-[2200px] mx-auto h-screen flex flex-col gap-8">

      <div className="bg-white p-8 rounded-[3rem] shadow-sm border-l-[14px] border-[#003366] flex flex-col lg:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-[#003366] uppercase italic leading-none">
            Monitor Maestro
          </h1>
          <p className="text-xs font-bold text-gray-400 tracking-[0.3em] uppercase mt-2 italic">
            Sistema de Gestión en Tiempo Real
          </p>
        </div>

        <div className="relative w-full max-w-xl">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
          <input 
            type="text"
            placeholder="BUSCAR PUESTO O PLACA..."
            className="w-full pl-14 pr-6 py-5 bg-gray-100 rounded-[1.5rem] font-bold text-lg outline-none border-2 border-transparent focus:border-[#003366] transition-all"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>

        <button
          onClick={fetchInitialData}
          className="p-5 bg-[#003366] text-white rounded-2xl hover:scale-110 active:scale-95 transition-all shadow-lg"
        >
          <RefreshCcw size={28} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* 🔽 SOLO ESTA SECCIÓN SCROLLEA */}
      <div className="flex-1 overflow-y-auto pr-2">
        {loading && slots.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center gap-4">
            <Loader2 size={48} className="animate-spin text-[#003366]" />
            <p className="font-black text-[#003366] animate-pulse uppercase italic">
              Sincronizando Base de Datos...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredSlots.map((slot) => (
              <div
                key={slot.id}
                className={`p-8 rounded-[2.5rem] border-4 transition-all duration-500 ${
                  slot.status === 'occupied'
                    ? 'bg-white border-blue-100 shadow-xl'
                    : 'bg-gray-100/40 border-transparent opacity-60'
                }`}
              >
                <div className="flex justify-between items-center mb-6">
                  <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-4xl font-black shadow-inner ${
                    slot.status === 'occupied'
                      ? 'bg-[#003366] text-white'
                      : 'bg-white text-gray-300'
                  }`}>
                    {slot.number}
                  </div>
                  <span className={`text-[10px] font-black px-5 py-2 rounded-full uppercase tracking-widest border-2 ${
                    slot.status === 'occupied'
                      ? 'bg-red-50 text-red-600 border-red-100'
                      : 'bg-green-50 text-green-600 border-green-100'
                  }`}>
                    {slot.status === 'occupied' ? 'Ocupado' : 'Disponible'}
                  </span>
                </div>

                {slot.status === 'occupied' ? (
                  <div className="space-y-5">
                    <div className="flex items-center gap-3">
                      <UserIcon size={20} className="text-gray-400" />
                      <p className="text-xl font-black uppercase text-gray-800 italic truncate">
                        {slot.profiles?.full_name || "Usuario UCE"}
                      </p>
                    </div>

                    <div className="bg-[#003366] p-5 rounded-[2rem] text-white shadow-lg">
                      <p className="text-[10px] font-bold opacity-60 uppercase mb-1">
                        Identificación Vehicular
                      </p>
                      <p className="text-3xl font-black uppercase">
                        {slot.vehicles?.license_plate || "S/P"}
                      </p>
                      <p className="text-sm font-bold opacity-80 uppercase italic mt-1">
                        {slot.vehicles?.model || "Vehículo Registrado"}
                      </p>
                    </div>

                    <button
                      onClick={() => forceRelease(slot.id, slot.user_id)}
                      className="w-full py-5 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all border-2 border-red-100 flex items-center justify-center gap-2"
                    >
                      <LogOut size={16} /> Liberar Puesto
                    </button>
                  </div>
                ) : (
                  <div className="py-16 text-center flex flex-col items-center justify-center gap-4">
                    <CheckCircle2 size={48} className="text-gray-200" />
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                      Listo para usar
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}