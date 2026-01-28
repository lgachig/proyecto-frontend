import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Trash2, X, Layers } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

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
      const lat = e.latlng.lat.toFixed(6);
      const lng = e.latlng.lng.toFixed(6);
      onSelect(lat, lng);
      if (typeof navigator !== 'undefined') {
        navigator.clipboard.writeText(`${lat}, ${lng}`);
      }
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

  const [formData, setFormData] = useState({
    number: '',
    status: 'available',
    latitude: '',
    longitude: '',
    zone_id: '',
  });

  const [zoneFormData, setZoneFormData] = useState({
    name: '',
    code: '',
    center_latitude: '',
    center_longitude: '',
  });

  const fetchData = async () => {
    const { data: z } = await supabase.from('parking_zones').select('*').order('name');
    const { data: s } = await supabase.from('parking_slots').select('*, parking_zones(name)').order('number');
    setZones(z || []);
    setSlots(s || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const saveSlot = async (e) => {
    e.preventDefault();
    if (!formData.latitude || !formData.zone_id) return alert('Faltan datos');

    const payload = {
      number: formData.number,
      status: formData.status,
      zone_id: formData.zone_id,
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
    };

    const { error } = editingSlot
      ? await supabase.from('parking_slots').update(payload).eq('id', editingSlot.id)
      : await supabase.from('parking_slots').insert([{ ...payload, id: crypto.randomUUID() }]);

    if (!error) {
      setIsSlotModalOpen(false);
      setEditingSlot(null);
      fetchData();
    }
  };

  const saveZone = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('parking_zones').insert([
      {
        id: crypto.randomUUID(),
        name: zoneFormData.name.toUpperCase(),
        code: zoneFormData.code.toUpperCase(),
        center_latitude: parseFloat(zoneFormData.center_latitude),
        center_longitude: parseFloat(zoneFormData.center_longitude),
      },
    ]);
    if (!error) {
      setIsZoneModalOpen(false);
      fetchData();
    }
  };

  if (loading) return <div className="h-full flex items-center justify-center font-black text-[#003366] text-4xl italic">CARGANDO...</div>;

  return (
    <div className="h-[calc(100vh-180px)] flex flex-col overflow-hidden relative">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm mb-6 flex justify-between items-center">
        <h1 className="text-5xl font-black text-[#003366] italic uppercase">
          GESTIÓN <span className="text-[#CC0000]">SLOTS</span>
        </h1>
        <button
          onClick={() => {
            setEditingSlot(null);
            setFormData({ number: '', status: 'available', latitude: '', longitude: '', zone_id: '' });
            setIsSlotModalOpen(true);
          }}
          className="bg-[#003366] text-white px-10 py-5 rounded-3xl font-black text-xl shadow-xl"
        >
          + AGREGAR PUESTO
        </button>
      </div>

      <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-3 gap-6 pb-10">
        {slots.map((slot) => (
          <div key={slot.id} className="bg-white rounded-[2.5rem] p-8 shadow-md border-2 border-transparent hover:border-[#003366] transition-all">
            <div className="flex justify-between items-start mb-4">
              <span className="text-6xl font-black text-[#003366] italic leading-none">{slot.number}</span>
              <span
                className={`px-4 py-1 rounded-full font-black text-[10px] uppercase ${
                  slot.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                }`}
              >
                {slot.status}
              </span>
            </div>
            <p className="text-sm font-black text-gray-400 uppercase italic mb-6 flex items-center gap-2">
              <Layers size={14} className="text-[#CC0000]" /> {slot.parking_zones?.name}
            </p>
            <div className="flex gap-3 border-t pt-6">
              <button
                onClick={() => {
                  setEditingSlot(slot);
                  setFormData(slot);
                  setIsSlotModalOpen(true);
                }}
                className="flex-1 py-4 bg-gray-100 text-[#003366] rounded-2xl font-black text-sm uppercase"
              >
                EDITAR
              </button>
              <button
                onClick={() => {
                  if (confirm('¿Eliminar?')) supabase.from('parking_slots').delete().eq('id', slot.id).then(fetchData);
                }}
                className="p-4 bg-red-50 text-[#CC0000] rounded-2xl"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isSlotModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#001529]/95 backdrop-blur-md">
          <div className="bg-white w-full max-w-7xl rounded-[4rem] p-12 shadow-2xl relative flex gap-10 h-[85vh]">
            <button
              onClick={() => {
                setIsSlotModalOpen(false);
                setEditingSlot(null);
              }}
              className="absolute top-8 right-8 text-gray-400"
            >
              <X size={40} />
            </button>

            <div className="w-1/3 space-y-6 flex flex-col">
              <h2 className="text-4xl font-black uppercase italic text-[#003366]">
                {editingSlot ? 'Editar' : 'Nuevo'} <span className="text-[#CC0000]">Slot</span>
              </h2>
              <div className="flex gap-2">
                <select
                  className="flex-1 p-5 bg-gray-50 rounded-2xl font-bold border-2"
                  value={formData.zone_id}
                  onChange={(e) => setFormData({ ...formData, zone_id: e.target.value })}
                >
                  <option value="">Zona...</option>
                  {zones.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.name}
                    </option>
                  ))}
                </select>
                <button onClick={() => setIsZoneModalOpen(true)} className="p-5 bg-[#CC0000] text-white rounded-2xl">
                  <Plus size={24} />
                </button>
              </div>
              <input
                className="w-full p-5 bg-gray-100 rounded-2xl font-black text-2xl text-center"
                placeholder="P-01"
                value={formData.number}
                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
              />
              <div className="p-6 bg-blue-50 rounded-[2rem] border-2 border-blue-100 font-mono text-sm font-bold text-[#003366]">
                LAT: {formData.latitude || '---'}
                <br />
                LNG: {formData.longitude || '---'}
              </div>
              <button
                onClick={saveSlot}
                className="w-full py-7 bg-[#003366] text-white rounded-[2rem] font-black text-2xl uppercase mt-auto shadow-xl"
              >
                GUARDAR SLOT
              </button>
            </div>

            <div className="flex-1 rounded-[3rem] overflow-hidden border-8 border-gray-50 relative">
              <MapContainer key="map-slot" center={[-0.1985, -78.5035]} zoom={19} maxZoom={22} className="h-full w-full">
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" maxZoom={22} />
                <MapTracker onSelect={(lat, lng) => setFormData({ ...formData, latitude: lat, longitude: lng })} />
                {slots
                  .filter((s) => s.id !== editingSlot?.id)
                  .map((s) => (
                    <Marker key={s.id} position={[s.latitude, s.longitude]} icon={iconExistente} />
                  ))}
                {formData.latitude && <Marker position={[formData.latitude, formData.longitude]} icon={iconNuevo} />}
              </MapContainer>
            </div>
          </div>
        </div>
      )}

      {isZoneModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm">
          <div className="bg-white w-full max-w-6xl rounded-[3.5rem] p-12 shadow-2xl relative flex gap-10 h-[80vh] border-t-[15px] border-[#CC0000]">
            <div className="w-1/3 space-y-6 flex flex-col">
              <h2 className="text-4xl font-black text-[#003366] uppercase italic">
                Nueva <span className="text-[#CC0000]">Zona</span>
              </h2>
              <input
                className="w-full p-5 bg-gray-50 border-2 rounded-2xl font-bold"
                placeholder="NOMBRE"
                value={zoneFormData.name}
                onChange={(e) => setZoneFormData({ ...zoneFormData, name: e.target.value })}
              />
              <input
                className="w-full p-5 bg-gray-50 border-2 rounded-2xl font-bold"
                placeholder="CÓDIGO"
                value={zoneFormData.code}
                onChange={(e) => setZoneFormData({ ...zoneFormData, code: e.target.value })}
              />
              <div className="p-6 bg-red-50 rounded-2xl border-2 border-red-100 font-mono text-xs font-bold text-[#CC0000]">
                CENTRO:{' '}
                {zoneFormData.center_latitude
                  ? `${zoneFormData.center_latitude}, ${zoneFormData.center_longitude}`
                  : 'CLIC EN MAPA'}
              </div>
              <button
                onClick={saveZone}
                className="w-full py-6 bg-[#CC0000] text-white rounded-2xl font-black text-xl uppercase mt-auto shadow-lg"
              >
                CREAR ZONA
              </button>
              <button onClick={() => setIsZoneModalOpen(false)} className="w-full text-gray-400 font-bold uppercase text-sm">
                CERRAR
              </button>
            </div>
            <div className="flex-1 rounded-[3rem] overflow-hidden border-4 border-gray-100 relative shadow-inner">
              <MapContainer key="map-zone" center={[-0.1985, -78.5035]} zoom={18} className="h-full w-full">
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <MapTracker
                  onSelect={(lat, lng) => setZoneFormData({ ...zoneFormData, center_latitude: lat, center_longitude: lng })}
                />
                {zoneFormData.center_latitude && (
                  <Marker position={[zoneFormData.center_latitude, zoneFormData.center_longitude]} icon={iconNuevo} />
                )}
              </MapContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
