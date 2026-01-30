"use client";
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth'; 
import { AlertTriangle, Bell, CheckCircle2, XCircle, Info, Timer } from 'lucide-react';

export default function RealtimeNotifier() {
  const { profile, user } = useAuth();
  const [alert, setAlert] = useState(null);

  // Función para mostrar la alerta visual en pantalla
  const showNotification = useCallback((msg, type) => {
    setAlert({ msg, type });
    // Sonido de notificación opcional
    try { const audio = new Audio('/notification.mp3'); audio.play(); } catch(e) {}
    
    setTimeout(() => setAlert(null), 8000); // 8 segundos de visibilidad
  }, []);

  // 1. Lógica para verificar ocupación (80% y 100%)
  // Solo el administrador dispara la inserción de estas alertas globales para evitar duplicados
  const checkGlobalStatus = useCallback(async () => {
    if (profile?.role_id !== 'r003') return; 

    const { data: slots } = await supabase.from('parking_slots').select('status');
    if (!slots) return;

    const occupied = slots.filter(s => s.status === 'occupied').length;
    const total = slots.length;
    const porcentaje = Math.round((occupied / total) * 100);

    // Si llega a límites críticos, creamos una notificación en la DB para todos
    if (porcentaje >= 100 || porcentaje === 80) {
      const type = porcentaje >= 100 ? 'danger' : 'info';
      const title = porcentaje >= 100 ? "⚠️ PARQUEADERO LLENO" : "📢 ALTA OCUPACIÓN";
      const message = porcentaje >= 100 
        ? "Se ha alcanzado el 100% de capacidad. No hay espacios disponibles." 
        : `El parqueadero está al ${porcentaje}% de su capacidad.`;

      // Evitar spam: solo insertar si no hay una notificación similar reciente (opcional)
      await supabase.from('notifications').insert({
        title,
        message,
        type,
        role_target: 'all' // Esto llegará a todos
      });
    }
  }, [profile]);

  useEffect(() => {
    if (!user || !profile) return;

    // 2. Suscripción a la tabla NOTIFICATIONS (Tiempo real corregido)
    const channel = supabase
      .channel('global-realtime-alerts')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'notifications' 
        }, 
        (payload) => {
          const newNotif = payload.new;

          // FILTRADO DE DESTINATARIO:
          // - Si es para todos (all)
          // - Si es específicamente para mi ID de usuario
          // - Si soy admin y la notificación es para admins
          const isForMe = 
            newNotif.role_target === 'all' || 
            newNotif.user_id === user.id || 
            (profile.role_id === 'r003' && newNotif.role_target === 'admin');

          if (isForMe) {
            showNotification(`${newNotif.title}: ${newNotif.message}`, newNotif.type);
          }
        }
      )
      // 3. También escuchamos cambios en SLOTS para alertas inmediatas de estado
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'parking_slots' 
        }, 
        (payload) => {
          const newSlot = payload.new;
          const oldSlot = payload.old;

          // Si el usuario acaba de estacionar (pasó de available a occupied y es su ID)
          if (newSlot.status === 'occupied' && oldSlot.status === 'available' && newSlot.user_id === user.id) {
            showNotification(`✅ HAS SELECCIONADO EL PUESTO ${newSlot.number}`, "success");
          }

          // Si el admin está mirando, verificar capacidad global tras cada cambio
          if (profile.role_id === 'r003') {
            checkGlobalStatus();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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
      <div className={`${styles[alert.type] || styles.info} p-6 rounded-[2rem] shadow-2xl flex items-center gap-4 border-4 transition-all`}>
        <div className="bg-white/20 p-3 rounded-full">
          {alert.type === 'success' && <CheckCircle2 size={32} />}
          {alert.type === 'danger' && <AlertTriangle size={32} />}
          {alert.type === 'info' && <Bell size={32} />}
          {alert.type === 'warning' && <Timer size={32} />}
        </div>
        <div className="flex-1">
          <p className="font-black text-lg leading-tight uppercase tracking-tight">
            {alert.msg}
          </p>
        </div>
        <button onClick={() => setAlert(null)} className="hover:rotate-90 transition-transform">
          <XCircle size={24} />
        </button>
      </div>
    </div>
  );
}