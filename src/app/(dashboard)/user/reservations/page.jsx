"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabase";
import { useAuth } from "../../../../hooks/useAuth";
import { Clock, Calendar, Car, History, Loader2, Timer, TrendingUp, MapPin, X, Info } from "lucide-react";

export default function HistoryPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null); 

  useEffect(() => {
    if (user) {
      const fetchHistory = async () => {
        const { data, error } = await supabase
          .from("parking_sessions")
          .select(`
            id,
            start_time,
            end_time,
            status,
            parking_slots (number, latitude, longitude)
          `)
          .eq("user_id", user.id)
          .order("start_time", { ascending: false });

        if (!error) setSessions(data || []);
        setLoading(false);
      };
      fetchHistory();
    }
  }, [user]);

  const getMostUsedSlot = () => {
    if (sessions.length === 0) return "-";
    const counts = sessions.reduce((acc, s) => {
      const num = s.parking_slots?.number;
      if (num) acc[num] = (acc[num] || 0) + 1;
      return acc;
    }, {});
    return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b, "-");
  };

  const calculateDuration = (start, end, status) => {
    const startTime = new Date(start);
    const endTime = status === 'active' ? new Date() : new Date(end);
    const diffInMs = endTime - startTime;
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    const hours = Math.floor(diffInMins / 60);
    const mins = diffInMins % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins} min`;
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center font-black text-[#003366] bg-gray-50">
      <Loader2 className="animate-spin mb-4" size={50} />
      <p className="uppercase italic tracking-[0.3em] text-lg">Cargando Historial UCE...</p>
    </div>
  );

  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto h-screen flex flex-col bg-gray-50/50 relative">
      
      <div className="mb-10 shrink-0">
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-[#003366] p-4 rounded-2xl shadow-xl">
            <History className="text-white" size={32} />
          </div>
          <div>
            <h1 className="text-5xl font-black text-[#003366] uppercase italic tracking-tighter leading-none">Mi Actividad</h1>
            <p className="text-gray-400 font-bold uppercase text-xs tracking-widest mt-2 ml-1">Panel de Control de Estacionamiento</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border-b-4 border-[#CC0000] flex items-center gap-5">
            <div className="bg-red-50 p-3 rounded-xl"><Car className="text-[#CC0000]" /></div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase">Total Reservas</p>
              <p className="text-3xl font-black text-[#003366]">{sessions.length}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border-b-4 border-[#003366] flex items-center gap-5">
            <div className="bg-blue-50 p-3 rounded-xl"><TrendingUp className="text-[#003366]" /></div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase">Puesto Favorito</p>
              <p className="text-3xl font-black text-[#003366]">{getMostUsedSlot()}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border-b-4 border-green-500 flex items-center gap-5">
            <div className="bg-green-50 p-3 rounded-xl"><Timer className="text-green-600" /></div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase">Estado Actual</p>
              <p className="text-xl font-black text-green-600 uppercase italic">
                {sessions[0]?.status === 'active' ? 'En el campus' : 'Fuera'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar pb-10">
        <div className="grid gap-6">
          {sessions.map((session) => (
            <div 
              key={session.id} 
              className="group bg-white p-8 rounded-[2.5rem] shadow-md hover:shadow-2xl transition-all duration-500 border-2 border-transparent hover:border-[#003366]/10 flex flex-col md:flex-row items-center gap-8"
            >
              <div className={`w-24 h-24 rounded-[2rem] flex flex-col items-center justify-center font-black shrink-0 shadow-lg ${
                session.status === 'active' ? 'bg-[#CC0000] text-white' : 'bg-[#003366] text-white'
              }`}>
                <span className="text-[10px] uppercase opacity-60">Puesto</span>
                <span className="text-4xl">{session.parking_slots?.number}</span>
              </div>

              <div className="flex-1 space-y-3 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-3">
                  <h2 className="text-2xl font-black text-gray-900 uppercase italic">Campus Central UCE</h2>
                  <span className={`mx-auto md:mx-0 px-4 py-1 rounded-full text-[10px] font-black ${
                    session.status === 'active' ? 'bg-green-100 text-green-600 animate-pulse' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {session.status === 'active' ? '● SESIÓN ACTIVA' : 'FINALIZADO'}
                  </span>
                </div>
                
                <div className="flex flex-wrap justify-center md:justify-start gap-3">
                  <div className="flex items-center gap-2 text-gray-500 bg-gray-50 border border-gray-100 px-4 py-2 rounded-xl text-sm font-bold">
                    <Calendar size={16} className="text-[#003366]" />
                    {new Date(session.start_time).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2 text-[#CC0000] bg-red-50 px-4 py-2 rounded-xl text-sm font-black">
                    <Timer size={16} />
                    {calculateDuration(session.start_time, session.end_time, session.status)}
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setSelectedSession(session)}
                className="w-full md:w-auto flex items-center justify-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-[#003366] transition-all active:scale-95 shadow-lg"
              >
                <MapPin size={16} /> Ver Ubicación
              </button>
            </div>
          ))}
        </div>
      </div>

      {selectedSession && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-[#003366]/60 backdrop-blur-md transition-all">
          <div className="bg-white w-full max-w-lg rounded-[3.5rem] p-10 shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)] relative">
            <button 
              onClick={() => setSelectedSession(null)} 
              className="absolute top-8 right-8 p-2 hover:bg-red-50 text-gray-400 hover:text-[#CC0000] rounded-full transition-colors"
            >
              <X size={28} />
            </button>

            <div className="text-center">
              <div className="w-24 h-24 bg-blue-50 text-[#003366] rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 shadow-inner">
                <MapPin size={48} />
              </div>
              
              <h3 className="text-4xl font-black text-[#003366] uppercase italic tracking-tighter">
                Puesto {selectedSession.parking_slots?.number}
              </h3>
              <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-2">Detalles de Referencia</p>

              <div className="mt-8 space-y-4">
                <div className="flex justify-between items-center p-5 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-3">
                    <Info size={18} className="text-[#CC0000]" />
                    <span className="text-xs font-black text-gray-400 uppercase">Sector:</span>
                  </div>
                  <span className="text-xs font-bold text-[#003366]">Facultad de Ingeniería</span>
                </div>

                <div className="flex justify-between items-center p-5 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-3">
                    <TrendingUp size={18} className="text-[#003366]" />
                    <span className="text-xs font-black text-gray-400 uppercase">Coordenadas:</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-white px-3 py-1 rounded-lg shadow-sm">
                    {selectedSession.parking_slots?.latitude}, {selectedSession.parking_slots?.longitude}
                  </span>
                </div>
              </div>

              <p className="mt-6 text-sm text-gray-500 italic font-medium px-4">
                "Ubicado en el área sombreada junto al edificio administrativo."
              </p>

              <button 
                onClick={() => setSelectedSession(null)}
                className="w-full mt-10 py-5 bg-[#003366] text-white rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-blue-800 transition-all active:scale-95"
              >
                Cerrar Detalle
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #003366; border-radius: 10px; }
      `}</style>
    </div>
  );
}