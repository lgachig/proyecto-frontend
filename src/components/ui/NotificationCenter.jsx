import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Bell, Check, X, Info, AlertTriangle, CheckCircle } from 'lucide-react';

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    
    const channel = supabase
      .channel('public:notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, 
        (payload) => {
          setNotifications(prev => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
        
      if (!error && data) setNotifications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
    await supabase.from('notifications').update({ read: true }).eq('id', id);
  };
  const getIcon = (type) => {
    switch(type) {
      case 'success': return <CheckCircle className="text-green-500" size={24} />;
      case 'warning': return <AlertTriangle className="text-orange-500" size={24} />;
      case 'error': return <X className="text-red-500" size={24} />;
      default: return <Info className="text-blue-500" size={24} />;
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-400 font-bold">Cargando avisos...</div>;

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
        <Bell size={48} className="mb-4 opacity-20" />
        <p className="font-bold text-lg">Estás al día</p>
        <p className="text-sm">No hay notificaciones nuevas</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {notifications.map((notif) => (
        <div 
          key={notif.id} 
          className="flex gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-blue-50 transition-colors group relative border border-transparent hover:border-blue-100"
        >
          <div className="mt-1 flex-shrink-0">
            {getIcon(notif.type)}
          </div>
          
          <div className="flex-1 pr-6">
            <h4 className="font-black text-gray-800 text-base mb-1">{notif.title}</h4>
            <p className="text-gray-600 text-sm leading-relaxed">{notif.message}</p>
            <p className="text-xs text-gray-400 font-bold mt-2 uppercase tracking-wider">
              {new Date(notif.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </p>
          </div>

          <button 
            onClick={() => markAsRead(notif.id)}
            className="absolute top-4 right-4 p-2 text-gray-300 hover:text-blue-600 hover:bg-blue-100 rounded-full transition-all opacity-0 group-hover:opacity-100"
            title="Marcar como leída"
          >
            <Check size={18} strokeWidth={3} />
          </button>
        </div>
      ))}
    </div>
  );
}