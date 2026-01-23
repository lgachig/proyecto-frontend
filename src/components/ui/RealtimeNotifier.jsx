"use client";
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth'; 
import { AlertTriangle, ShieldAlert, CheckCircle2, XCircle, Info } from 'lucide-react';

export default function RealtimeNotifier() {
  const { profile, user } = useAuth();
  const [alert, setAlert] = useState(null);

  const showNotification = (msg, type) => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 5000);
  };

  // Exponer la función globalmente para reemplazar los alerts
  useEffect(() => {
    window.notify = showNotification;
  }, []);

  const checkGlobalStatus = useCallback(async () => {
    if (profile?.role_id !== 'r003') return; // Solo admin
    const { data } = await supabase.from('parking_slots').select('status');
    if (!data) return;

    const occupied = data.filter(s => s.status === 'occupied').length;
    const porcentaje = Math.round((occupied / data.length) * 100);

    if (porcentaje >= 90) {
      setAlert({ msg: `🚨 CAPACIDAD CRÍTICA: ${porcentaje}%`, type: "danger" });
    }
  }, [profile]);

  useEffect(() => {
    if (!profile) return;

    const channel = supabase
      .channel('realtime-logic')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'parking_slots' }, 
        (payload) => {
          const { new: newSlot } = payload;
          
          // Lógica para Usuario: Confirmación inmediata
          if (profile.role_id !== 'r003' && newSlot.user_id === user?.id) {
            if (newSlot.status === 'occupied') {
              showNotification(`✅ PUESTO ${newSlot.number} RESERVADO`, "success");
            } else {
              showNotification(`ℹ️ PUESTO ${newSlot.number} LIBERADO`, "info");
            }
          }

          // Lógica para Admin: Solo cambios críticos
          if (profile.role_id === 'r003') {
            checkGlobalStatus();
          }
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [profile, user, checkGlobalStatus]);

  if (!alert) return null;

  const styles = {
    danger: "bg-red-600 border-white",
    success: "bg-green-600 border-white",
    info: "bg-blue-600 border-white",
    error: "bg-black border-red-600 text-white"
  };

  return (
    <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[10000] w-full max-w-md px-4 animate-in fade-in zoom-in duration-300">
      <div className={`${styles[alert.type]} text-white px-8 py-6 rounded-[2rem] shadow-2xl flex items-center gap-4 border-4 transition-all`}>
        {alert.type === 'success' && <CheckCircle2 size={32} />}
        {alert.type === 'danger' && <ShieldAlert size={32} />}
        {alert.type === 'error' && <XCircle size={32} className="text-red-500" />}
        {alert.type === 'info' && <Info size={32} />}
        <span className="font-black uppercase italic tracking-tighter text-lg leading-tight">
          {alert.msg}
        </span>
      </div>
    </div>
  );
}