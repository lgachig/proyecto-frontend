import { useEffect, useState, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Trash2, X, Layers, MapPin, Search, Edit3, Save } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// --- CONFIGURACIÓN LEAFLET ---
const iconNuevo = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
const iconExistente = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  iconSize: [20, 32],
  iconAnchor: [10, 32],
});

function MapTracker({ onSelect }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat.toFixed(6), e.latlng.lng.toFixed(6));
    },
  });
  return null;
}

export default function AdminSlots() {
  const [slots, setSlots] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [isZoneModalOpen, setIsZoneModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({ number: '', status: 'available', latitude: '', longitude: '', zone_id: '' });
  const [zoneFormData, setZoneFormData] = useState({ name: '', code: '', center_latitude: '', center_longitude: '' });

  const fetchData = async () => {
    const { data: z } = await supabase.from('parking_zones').select('*').order('name');
    const { data: s } = await supabase.from('parking_slots').select('*, parking_zones(name)').order('number');
    setZones(z || []);
    setSlots(s || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const filteredSlots = useMemo(() => {
    if (!searchTerm) return slots;
    const term = searchTerm.toLowerCase();
    return slots.filter(s => s.number.toLowerCase().includes(term) || s.parking_zones?.name?.toLowerCase().includes(term));
  }, [slots, searchTerm]);

  const saveSlot = async (e) => {
    e.preventDefault();
    if (!formData.latitude || !formData.zone_id) return alert('Faltan coordenadas o zona');
    const payload = { ...formData, latitude: parseFloat(formData.latitude), longitude: parseFloat(formData.longitude) };
    const { error } = editingSlot 
      ? await supabase.from('parking_slots').update(payload).eq('id', editingSlot.id)
      : await supabase.from('parking_slots').insert([{ ...payload, id: crypto.randomUUID() }]);
    if (!error) { setIsSlotModalOpen(false); fetchData(); }
  };

  const saveZone = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('parking_zones').insert([{ ...zoneFormData, id: crypto.randomUUID(), center_latitude: parseFloat(zoneFormData.center_latitude), center_longitude: parseFloat(zoneFormData.center_longitude) }]);
    if (!error) { setIsZoneModalOpen(false); fetchData(); }
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-black text-[#003366] animate-pulse text-lg">CARGANDO...</div>;

  return (
    <div className="h-full flex flex-col gap-4 p-3 md:p-6 lg:p-8 font-sans">
      
      {/* HEADER COMPACTO EN MÓVIL */}
      <div className="flex-none bg-white p-5 lg:p-8 rounded-[2rem] lg:rounded-[3.5rem] shadow-md border-l-[10px] lg:border-l-[18px] border-[#003366] flex flex-col xl:flex-row justify-between items-center gap-4 lg:gap-8">
        <div className="text-center xl:text-left w-full xl:w-auto">
          <h1 className="text-2xl lg:text-5xl font-black text-[#003366] uppercase italic leading-none tracking-tighter">
            GESTIÓN <span className="text-[#CC0000]">SLOTS</span>
          </h1>
          <p className="text-[10px] lg:text-sm font-bold text-gray-400 mt-1 uppercase tracking-[0.2em]">Configuración Mapa</p>
        </div>
        
        {/* BUSCADOR */}
        <div className="relative w-full max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="BUSCAR..."
            className="w-full pl-10 pr-4 py-3 lg:py-6 bg-gray-100 rounded-2xl lg:rounded-[2rem] font-bold text-sm lg:text-lg outline-none border-2 border-transparent focus:border-[#003366] transition-all"
          />
        </div>
        
        {/* BOTÓN NUEVO */}
        <button
          onClick={() => { setEditingSlot(null); setFormData({ number: '', status: 'available', latitude: '', longitude: '', zone_id: '' }); setIsSlotModalOpen(true); }}
          className="w-full xl:w-auto flex justify-center gap-2 px-6 py-3 lg:py-6 bg-[#003366] text-white rounded-2xl lg:rounded-[2rem] font-black text-xs lg:text-sm uppercase shadow-xl hover:bg-[#002244] transition-all"
        >
          <Plus size={18} /> NUEVO
        </button>
      </div>

      {/* GRID DE PUESTOS (Compacto en móvil) */}
      <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6 pb-20">
          {filteredSlots.map((slot) => (
            <div key={slot.id} className="bg-white rounded-[2rem] p-5 lg:p-8 shadow-sm border border-gray-100 hover:shadow-xl transition-all group relative overflow-hidden">
              <div className="absolute -right-6 -top-6 w-20 h-20 bg-gray-50 rounded-full group-hover:bg-blue-50 transition-colors"></div>
              
              <div className="relative z-10 flex justify-between items-start mb-2">
                <span className="text-4xl lg:text-5xl font-black text-[#003366] italic leading-none">{slot.number}</span>
                <span className={`px-2 py-1 rounded-lg font-black text-[9px] lg:text-[10px] uppercase tracking-wider ${slot.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                  {slot.status === 'available' ? 'Libre' : 'Ocupado'}
                </span>
              </div>
              
              <div className="relative z-10 flex items-center gap-1 mb-6">
                <Layers size={14} className="text-[#CC0000]" />
                <p className="text-[10px] lg:text-xs font-bold text-gray-400 uppercase tracking-widest">{slot.parking_zones?.name || 'SIN ZONA'}</p>
              </div>
              
              <div className="relative z-10 flex gap-2">
                <button
                  onClick={() => { setEditingSlot(slot); setFormData(slot); setIsSlotModalOpen(true); }}
                  className="flex-1 py-2 lg:py-3 bg-gray-100 text-[#003366] rounded-xl font-bold text-[10px] lg:text-xs uppercase hover:bg-gray-200 flex items-center justify-center gap-1"
                >
                  <Edit3 size={14} /> Editar
                </button>
                <button
                  onClick={() => { if (confirm('¿Borrar slot?')) supabase.from('parking_slots').delete().eq('id', slot.id).then(fetchData); }}
                  className="p-2 lg:p-3 bg-red-50 text-[#CC0000] rounded-xl hover:bg-red-100"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL SLOT (Adaptado a móvil) */}
      {isSlotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-[#001529]/90 backdrop-blur-md overflow-y-auto">
          <div className="bg-white w-full max-w-5xl rounded-[2.5rem] lg:rounded-[3.5rem] p-6 lg:p-12 shadow-2xl flex flex-col lg:flex-row gap-6 lg:gap-10 relative h-auto lg:h-[85vh] my-auto border-t-[8px] lg:border-t-[12px] border-[#003366]">
            <button onClick={() => setIsSlotModalOpen(false)} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors z-20"><X size={20} /></button>

            {/* Panel Izquierdo: Datos */}
            <div className="w-full lg:w-1/3 flex flex-col gap-4 lg:gap-6">
              <h2 className="text-2xl lg:text-4xl font-black text-[#003366] uppercase italic leading-none mt-2">
                {editingSlot ? 'Editar' : 'Nuevo'} <br/><span className="text-[#CC0000]">Puesto</span>
              </h2>
              
              <div className="space-y-3 flex-1">
                <div className="flex gap-2">
                   <select className="flex-1 p-3 lg:p-5 bg-gray-50 rounded-2xl font-bold border-2 border-transparent focus:border-[#003366] outline-none text-sm lg:text-base text-gray-700" value={formData.zone_id} onChange={(e) => setFormData({ ...formData, zone_id: e.target.value })}>
                     <option value="">Zona...</option>
                     {zones.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
                   </select>
                   <button onClick={() => setIsZoneModalOpen(true)} className="p-3 lg:p-5 bg-[#CC0000] text-white rounded-2xl shadow-lg active:scale-95"><Plus size={20} /></button>
                </div>

                <input className="w-full p-3 lg:p-5 bg-gray-100 rounded-[2rem] font-black text-2xl lg:text-3xl text-center text-[#003366] border-2 border-transparent focus:border-[#003366] outline-none placeholder:text-gray-300" placeholder="A-00" value={formData.number} onChange={(e) => setFormData({ ...formData, number: e.target.value })} />

                <div className="p-4 lg:p-6 bg-blue-50 rounded-2xl lg:rounded-[2.5rem] border-2 border-blue-100">
                  <p className="text-[10px] lg:text-xs font-black text-blue-400 uppercase tracking-widest mb-1">GPS</p>
                  <p className="font-mono font-black text-[#003366] text-xs lg:text-lg break-all">
                    {formData.latitude ? `${formData.latitude}, ${formData.longitude}` : 'Toca el mapa 👉'}
                  </p>
                </div>
              </div>

              <button onClick={saveSlot} className="w-full py-4 lg:py-6 bg-[#003366] text-white rounded-2xl lg:rounded-[2rem] font-black text-sm lg:text-xl uppercase shadow-xl hover:bg-[#002244] active:scale-95 transition-all">
                Guardar
              </button>
            </div>

            {/* Panel Derecho: Mapa */}
            <div className="w-full lg:flex-1 h-[250px] lg:h-auto rounded-[2rem] lg:rounded-[3rem] overflow-hidden border-4 border-gray-100 relative shadow-inner">
              <MapContainer center={[-0.1985, -78.5035]} zoom={18} className="h-full w-full">
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <MapTracker onSelect={(lat, lng) => setFormData({ ...formData, latitude: lat, longitude: lng })} />
                {slots.filter(s => s.id !== editingSlot?.id).map(s => <Marker key={s.id} position={[s.latitude, s.longitude]} icon={iconExistente} />)}
                {formData.latitude && <Marker position={[formData.latitude, formData.longitude]} icon={iconNuevo} />}
              </MapContainer>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ZONA */}
      {isZoneModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-5xl rounded-[2.5rem] p-6 lg:p-12 shadow-2xl relative border-t-[8px] lg:border-t-[12px] border-[#CC0000] my-auto">
            <button onClick={() => setIsZoneModalOpen(false)} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors z-20"><X size={24} /></button>
            
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
              <div className="w-full lg:w-1/3 flex flex-col gap-4">
                <h2 className="text-2xl lg:text-4xl font-black text-[#003366] uppercase italic leading-none">
                  Nueva <span className="text-[#CC0000]">Zona</span>
                </h2>
                <div className="space-y-3 mt-2">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 ml-3 uppercase">Nombre</label>
                    <input className="w-full p-3 lg:p-5 bg-gray-50 border-2 border-transparent focus:border-[#CC0000] rounded-2xl font-bold text-gray-800 outline-none text-sm" placeholder="EJ: NIVEL SUPERIOR" value={zoneFormData.name} onChange={(e) => setZoneFormData({ ...zoneFormData, name: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 ml-3 uppercase">Código</label>
                    <input className="w-full p-3 lg:p-5 bg-gray-50 border-2 border-transparent focus:border-[#CC0000] rounded-2xl font-bold text-gray-800 outline-none text-sm" placeholder="EJ: NS" value={zoneFormData.code} onChange={(e) => setZoneFormData({ ...zoneFormData, code: e.target.value })} />
                  </div>
                </div>
                <div className="mt-auto flex flex-col gap-2">
                  <button onClick={saveZone} className="w-full py-4 lg:py-6 bg-[#CC0000] text-white rounded-2xl font-black text-sm lg:text-xl shadow-xl uppercase">Crear Zona</button>
                  <button onClick={() => setIsZoneModalOpen(false)} className="w-full py-3 text-gray-400 font-bold rounded-xl hover:bg-gray-50 uppercase text-[10px] tracking-widest">Cancelar</button>
                </div>
              </div>
              <div className="w-full lg:flex-1 h-[250px] lg:h-auto min-h-[300px] rounded-[2rem] overflow-hidden border-4 border-gray-100 relative shadow-inner">
                 <MapContainer center={[-0.1985, -78.5035]} zoom={16} className="h-full w-full">
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <MapTracker onSelect={(lat, lng) => setZoneFormData({ ...zoneFormData, center_latitude: lat, center_longitude: lng })} />
                    {zoneFormData.center_latitude && <Marker position={[zoneFormData.center_latitude, zoneFormData.center_longitude]} icon={iconNuevo} />}
                 </MapContainer>
                 <div className="absolute top-3 left-3 bg-white/90 px-3 py-1 rounded-lg text-[9px] font-black uppercase shadow-md z-[400] text-[#CC0000]">📍 Centro</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}