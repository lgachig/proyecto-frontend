"use client";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "../../../../lib/supabase";
import { 
  Plus, Trash2, MapPin, 
  X, Loader2, Search 
} from "lucide-react";

export default function SlotsManagement() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [search, setSearch] = useState("");

  const [formData, setFormData] = useState({
    number: "",
    status: "available",
    latitude: "",
    longitude: ""
  });

  useEffect(() => {
    fetchSlots();
    const subscription = supabase.channel('slots_admin').on('postgres_changes',{ event: '*', schema: 'public', table: 'parking_slots' },fetchSlots).subscribe();
    return () => supabase.removeChannel(subscription);
  }, []);

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const { data } = await supabase.from("parking_slots").select("*").order("number", { ascending: true });
      setSlots(data || []);
    } finally {
      setLoading(false);
    }
  };

  const filteredSlots = useMemo(() => {
    const term = search.toLowerCase().trim();
    if (!term) return slots;
    return slots.filter(s => s.number.toLowerCase().includes(term) || s.status.toLowerCase().includes(term));
  }, [search, slots]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { number: formData.number, status: formData.status, latitude: parseFloat(formData.latitude), longitude: parseFloat(formData.longitude) };
    if (editingSlot) { await supabase.from("parking_slots").update(payload).eq("id", editingSlot.id); } 
    else { await supabase.from("parking_slots").insert([payload]); }
    setIsModalOpen(false);
    setEditingSlot(null);
    setFormData({ number: "", status: "available", latitude: "", longitude: "" });
    fetchSlots();
  };

  const deleteSlot = async (id) => {
    if (confirm("¿ESTÁS SEGURO DE ELIMINAR ESTE PUESTO?")) {
      await supabase.from("parking_slots").delete().eq("id", id);
      fetchSlots();
    }
  };

  if (loading && slots.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-[#003366]" size={48} />
        <p className="font-black text-[#003366] italic uppercase">Sincronizando...</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-180px)] flex flex-col overflow-hidden">
      
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 mb-6 flex-none">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-5xl font-black text-[#003366] italic uppercase tracking-tighter">
              Gestión de <span className="text-[#CC0000]">Slots</span>
            </h1>
          </div>
          <button 
            onClick={() => { setEditingSlot(null); setFormData({ number: "", status: "available", latitude: "", longitude: "" }); setIsModalOpen(true); }}
            className="bg-[#003366] text-white px-10 py-5 rounded-3xl font-black text-xl flex items-center gap-3 hover:bg-blue-800 transition-all shadow-xl active:scale-95"
          >
            <Plus size={28} /> AGREGAR PUESTO
          </button>
        </div>

        <div className="relative max-w-xl">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={22} />
          <input
            placeholder="BUSCAR POR NÚMERO O ESTADO..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-gray-100 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-[#003366]"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar" style={{ maxHeight: 'calc(100vh - 450px)' }}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
          {filteredSlots.map((slot) => (
            <div key={slot.id} className="bg-white rounded-[2.5rem] p-8 shadow-md border-2 border-transparent hover:border-[#003366] transition-all">
              <div className="flex justify-between items-start mb-6">
                <span className="text-6xl font-black text-[#003366] italic leading-none">{slot.number}</span>
                <div className={`px-4 py-1 rounded-full font-black text-[10px] uppercase ${slot.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                  {slot.status}
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-400 font-bold text-sm uppercase mb-8">
                <MapPin size={16} /> {slot.latitude}, {slot.longitude}
              </div>
              <div className="flex gap-3 border-t pt-6">
                <button onClick={() => { setEditingSlot(slot); setFormData(slot); setIsModalOpen(true); }} className="flex-1 py-4 bg-gray-100 text-[#003366] rounded-2xl font-black text-sm uppercase hover:bg-[#003366] hover:text-white transition-all">EDITAR</button>
                <button onClick={() => deleteSlot(slot.id)} className="p-4 bg-red-50 text-[#CC0000] rounded-2xl hover:bg-[#CC0000] hover:text-white transition-all"><Trash2 size={20} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#001529]/90 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] p-12 shadow-2xl">
            <div className="flex justify-between items-center mb-8 text-[#003366]">
              <h2 className="text-3xl font-black uppercase">Datos del Puesto</h2>
              <button onClick={() => setIsModalOpen(false)}><X size={32} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <input className="w-full p-6 bg-gray-50 rounded-2xl border-4 border-transparent focus:border-[#003366] font-bold text-xl outline-none" placeholder="NÚMERO (P-01)" value={formData.number} onChange={(e) => setFormData({ ...formData, number: e.target.value.toUpperCase() })} />
              <div className="grid grid-cols-2 gap-4">
                <input className="p-6 bg-gray-50 rounded-2xl font-bold" placeholder="LATITUD" value={formData.latitude} onChange={(e) => setFormData({ ...formData, latitude: e.target.value })} />
                <input className="p-6 bg-gray-50 rounded-2xl font-bold" placeholder="LONGITUD" value={formData.longitude} onChange={(e) => setFormData({ ...formData, longitude: e.target.value })} />
              </div>
              <button className="w-full py-6 bg-[#003366] text-white rounded-2xl font-black text-xl uppercase tracking-widest shadow-xl">
                {editingSlot ? "ACTUALIZAR" : "CREAR"}
              </button>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #003366; border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
      `}</style>
    </div>
  );
}