"use client";
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { Bell, X } from 'lucide-react';

export default function NotificationCenter() {
  const { user, profile } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showHistory, setShowHistory] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    let query = supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(10);
    if (profile?.role_id !== 'r003') {
      query = query.or(`user_id.eq.${user.id},role_target.eq.all`);
    }
    const { data } = await query;
    setNotifications(data || []);
    setUnreadCount(data?.filter(n => !n.is_read).length || 0);
  }, [user, profile]);

  useEffect(() => {
    fetchNotifications();
    const channel = supabase.channel('realtime_notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, () => fetchNotifications())
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [user, profile, fetchNotifications]);

  const markAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
    if (unreadIds.length > 0) {
      await supabase.from('notifications').update({ is_read: true }).in('id', unreadIds);
      setUnreadCount(0);
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => { setShowHistory(!showHistory); if(!showHistory) markAsRead(); }}
        className="p-3 hover:bg-gray-100 rounded-full transition-all relative"
      >
        <Bell size={40} className={unreadCount > 0 ? "text-[#CC0000] animate-pulse" : "text-[#003366]"} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-[#CC0000] text-white text-sm font-black w-8 h-8 flex items-center justify-center rounded-full border-4 border-white shadow-lg">
            {unreadCount}
          </span>
        )}
      </button>

      {showHistory && (
        <div className="absolute right-0 mt-6 w-[calc(100vw-2rem)] max-w-[450px] bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] border-2 border-gray-100 overflow-hidden z-[100]">
          <div className="p-6 border-b bg-gray-50 flex justify-between items-center">
            <span className="font-black text-[#003366] uppercase text-xl tracking-tighter">Notificaciones</span>
            <button onClick={() => setShowHistory(false)}><X size={28} /></button>
          </div>
          <div className="max-h-[500px] overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="p-10 text-center text-gray-400 font-bold text-lg">No hay mensajes nuevos</p>
            ) : (
              notifications.map(n => (
                <div key={n.id} className={`p-6 border-b hover:bg-blue-50/50 transition-colors ${!n.is_read ? 'bg-blue-50/30 border-l-8 border-l-[#CC0000]' : ''}`}>
                  <p className="font-black text-sm text-[#003366] uppercase mb-1">{n.title}</p>
                  <p className="text-xl font-bold text-gray-600 leading-tight">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-3 font-bold uppercase">{new Date(n.created_at).toLocaleString()}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}