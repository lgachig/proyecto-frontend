"use client";
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth'; 
import { AlertTriangle, Bell, CheckCircle2, XCircle, Timer } from 'lucide-react';

export default function RealtimeNotifier() {
  const { profile, user } = useAuth();
  const [alert, setAlert] = useState(null);

  const showNotification = useCallback((msg, type) => {
    setAlert({ msg, type });
    try { const audio = new Audio('/notification.mp3'); audio.play(); } catch(e) {}
    setTimeout(() => setAlert(null), 8000);
  }, []);

  const checkGlobalStatus = useCallback(async () => {
    if (profile?.role_id !== 'r003') return; 
    const { data: slots } = await supabase.from('parking_slots').select('status');
    if (!slots) return;

    const occupied = slots.filter(s => s.status === 'occupied').length;
    const porcentaje = Math.round((occupied / slots.length) * 100);

    if (porcentaje >= 100 || porcentaje === 80) {
      const type = porcentaje >= 100 ? 'danger' : 'info';
      const title = porcentaje >= 100 ? "⚠️ PARQUEADERO LLENO" : "📢 ALTA OCUPACIÓN";
      const message = porcentaje >= 100 ? "Capacidad al 100%." : `Ocupación al ${porcentaje}%`;
      
      await supabase.from('notifications').insert({ title, message, type, role_target: 'all' });
    }
  }, [profile]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('system-realtime-notifications')
      
      // 1. Escuchar INSERT en NOTIFICACIONES (Mensajes del sistema/admin)
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'notifications' }, 
        (payload) => {
          const newNotif = payload.new;
          const isForMe = newNotif.role_target === 'all' || newNotif.user_id === user.id || 
            (profile?.role_id === 'r003' && newNotif.role_target === 'admin');
          if (isForMe) showNotification(`${newNotif.title}: ${newNotif.message}`, newNotif.type);
        }
      )
      
      // 2. Escuchar CAMBIOS DE SESIÓN (Para confirmar reserva o liberación)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'parking_sessions', filter: `user_id=eq.${user.id}` },
        (payload) => {
          // Si se crea una reserva (INSERT) y está activa
          if (payload.eventType === 'INSERT' && payload.new.status === 'active') {
             showNotification("✅ RESERVA CONFIRMADA: Tienes 15 minutos para llegar.", "success");
          }
          // Si la sesión cambia a completada (UPDATE) o se borra (DELETE)
          // Nota: DELETE no siempre trae payload.new, pero UPDATE sí
          if (payload.eventType === 'UPDATE' && payload.new.status === 'completed') {
             showNotification("👋 SESIÓN FINALIZADA: Gracias por usar UCE Smart Parking.", "info");
          }
        }
      )

      // 3. Monitor de ocupación (Solo Admin)
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'parking_slots' }, 
        () => {
          if (profile?.role_id === 'r003') checkGlobalStatus();
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, profile, showNotification, checkGlobalStatus]);

  if (!alert) return null;

  const styles = {
    danger: "bg-red-600 border-white text-white shadow-red-500/50",
    success: "bg-green-600 border-white text-white shadow-green-500/50",
    info: "bg-[#003366] border-white text-white shadow-blue-500/50",
    warning: "bg-orange-500 border-white text-white shadow-orange-500/50"
  };

  return (
    <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[10000] w-full max-w-md px-4 animate-in slide-in-from-top duration-500">
      <div className={`${styles[alert.type] || styles.info} p-6 rounded-[2rem] shadow-2xl flex items-center gap-4 border-4`}>
        <div className="bg-white/20 p-3 rounded-full">
          {alert.type === 'success' && <CheckCircle2 size={32} />}
          {alert.type === 'danger' && <AlertTriangle size={32} />}
          {alert.type === 'info' && <Bell size={32} />}
          {alert.type === 'warning' && <Timer size={32} />}
        </div>
        <div className="flex-1">
          <p className="font-black text-lg leading-tight uppercase tracking-tight">{alert.msg}</p>
        </div>
        <button onClick={() => setAlert(null)}><XCircle size={24} /></button>
      </div>
    </div>
  );
}