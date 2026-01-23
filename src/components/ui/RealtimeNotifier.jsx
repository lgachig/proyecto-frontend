"use client";
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth'; 
import { AlertTriangle, ShieldAlert } from 'lucide-react';

export default function RealtimeNotifier() {
  const { profile } = useAuth();
  const [alert, setAlert] = useState(null);

  const checkGlobalStatus = useCallback(async () => {
    const { data } = await supabase.from('parking_slots').select('status');
    if (!data || data.length === 0) return;

    const total = data.length;
    const occupied = data.filter(s => s.status === 'occupied').length;
    const porcentaje = Math.round((occupied / total) * 100);

    if (porcentaje >= 100) {
      setAlert({ msg: "🔴 CAPACIDAD TOTAL", type: "danger" });
    } else if (porcentaje >= 80) {
      setAlert({ msg: `⚠️ OCUPACIÓN AL ${porcentaje}%`, type: "warning" });
    } else {
      setAlert(null); 
    }
  }, []);

  const checkTimeViolations = useCallback(async () => {
    if (profile?.role_id !== 'r003') return;

    const { data: activeSessions } = await supabase
      .from('parking_sessions')
      .select('*, parking_slots(number)')
      .eq('status', 'active');

    const violations = activeSessions?.filter(session => {
      const horas = (new Date() - new Date(session.start_time)) / (1000 * 60 * 60);
      return horas > 3; 
    });

    if (violations?.length > 0) {
      setAlert({ 
        msg: `🚨 ${violations.length} EXCESO DE TIEMPO`, 
        type: "critical",
        detail: `Puestos: ${violations.map(v => v.parking_slots.number).join(', ')}`
      });
    }
  }, [profile]);

  useEffect(() => {
    checkGlobalStatus();
    checkTimeViolations();

    const channel = supabase
      .channel('admin-realtime-monitor')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'parking_slots' }, () => checkGlobalStatus())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'parking_sessions' }, () => checkTimeViolations())
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [checkGlobalStatus, checkTimeViolations]);

  if (!alert) return null;

  const styles = {
    danger: "bg-[#CC0000] border-white",
    warning: "bg-orange-500 border-white",
    critical: "bg-black border-[#CC0000] text-yellow-400 animate-pulse"
  };

  return (
    <div className="fixed top-28 left-1/2 -translate-x-1/2 z-[99999] w-full max-w-sm px-4">
      <div className={`${styles[alert.type] || styles.warning} text-white px-8 py-5 rounded-[2.5rem] shadow-2xl flex flex-col items-center gap-1 border-4 border-white`}>
        <div className="flex items-center gap-4">
            {alert.type === 'critical' ? <ShieldAlert size={30} className="text-red-500" /> : <AlertTriangle size={28} />}
            <span className="font-black uppercase italic tracking-tighter text-xl text-center">
            {alert.msg}
            </span>
        </div>
        {alert.detail && (
            <p className="text-[10px] font-bold opacity-90 tracking-widest uppercase bg-white/10 px-4 py-1 rounded-full mt-2 text-center">
                {alert.detail}
            </p>
        )}
      </div>
    </div>
  );
}