import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { Car, Save, Loader2, AlertCircle } from 'lucide-react';

export default function UserVehicle() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [vehicle, setVehicle] = useState({
    license_plate: '',
    make: '',
    model: '',
    color: '',
  });

  useEffect(() => {
    async function loadVehicleData() {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from('vehicles')
          .select('license_plate, make, model, color')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error al extraer de Supabase:', error.message);
          return;
        }

        if (data) {
          setVehicle({
            license_plate: data.license_plate || '',
            make: data.make || '',
            model: data.model || '',
            color: data.color || '',
          });
        }
      } catch (err) {
        console.error('Fallo crítico:', err);
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) loadVehicleData();
  }, [user, authLoading]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const { error } = await supabase.from('vehicles').upsert(
        {
          user_id: user.id,
          license_plate: vehicle.license_plate.toUpperCase().trim(),
          make: vehicle.make.trim(),
          model: vehicle.model.trim(),
          color: vehicle.color.trim(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );

      if (error) throw error;
      setMessage({ type: 'success', text: '¡Información del vehículo actualizada!' });
    } catch (err) {
      console.error('Error al guardar:', err);
      setMessage({ type: 'error', text: 'No se pudo guardar: ' + err.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center font-black text-[#003366]">
        <Loader2 className="animate-spin mb-4 text-[#CC0000]" size={40} />
        <p className="italic">SINCRONIZANDO TABLA VEHICLES...</p>
      </div>
    );

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">
      <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border-4 border-white">
        <div className="bg-[#003366] p-10 text-white relative">
          <h1 className="text-4xl font-black uppercase italic tracking-tighter">Mi Vehículo</h1>
          <p className="text-blue-200 font-bold mt-2 text-xs uppercase tracking-widest">ID de Usuario: {user?.id}</p>
          <Car className="absolute right-0 top-0 size-48 text-white/10 -rotate-12" />
        </div>

        <form onSubmit={handleSave} className="p-10 space-y-8">
          {message.text && (
            <div
              className={`p-4 rounded-2xl font-bold flex items-center gap-3 ${
                message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}
            >
              <AlertCircle size={20} /> {message.text}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-4">Placa (license_plate)</label>
              <input
                className="w-full p-6 bg-gray-50 border-4 border-transparent focus:border-[#003366] rounded-[2rem] outline-none font-black text-2xl uppercase transition-all"
                value={vehicle.license_plate}
                onChange={(e) => setVehicle({ ...vehicle, license_plate: e.target.value })}
                placeholder="PBA-1234"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-4">Marca (make)</label>
              <input
                className="w-full p-6 bg-gray-50 border-4 border-transparent focus:border-[#003366] rounded-[2rem] outline-none font-bold text-lg"
                value={vehicle.make}
                onChange={(e) => setVehicle({ ...vehicle, make: e.target.value })}
                placeholder="Ej. Toyota"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-4">Modelo (model)</label>
              <input
                className="w-full p-6 bg-gray-50 border-4 border-transparent focus:border-[#003366] rounded-[2rem] outline-none font-bold text-lg"
                value={vehicle.model}
                onChange={(e) => setVehicle({ ...vehicle, model: e.target.value })}
                placeholder="Ej. Corolla"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-4">Color (color)</label>
              <input
                className="w-full p-6 bg-gray-50 border-4 border-transparent focus:border-[#003366] rounded-[2rem] outline-none font-bold text-lg"
                value={vehicle.color}
                onChange={(e) => setVehicle({ ...vehicle, color: e.target.value })}
                placeholder="Ej. Blanco"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-6 bg-[#003366] text-white rounded-[2rem] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all text-xl"
          >
            {saving ? <Loader2 className="animate-spin" /> : <Save size={24} />}
            {saving ? 'ACTUALIZANDO...' : 'GUARDAR CAMBIOS'}
          </button>
        </form>
      </div>
    </div>
  );
}
