import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useSidebar } from "../../contexts/SidebarContext";
import { Bell, User, Menu } from "lucide-react";
import NotificationCenter from "./NotificationCenter";

export default function Header({ title }) {
  const { user, profile } = useAuth();
  const { expanded, toggleSidebar } = useSidebar();
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayName = profile?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "Usuario";
  const displayRole = profile?.role_id === 'r003' ? 'Administrador' : 
                      profile?.role_id === 'r002' ? 'Docente' : 'Estudiante';

  // Ajuste de margen izquierdo (Coincide con el nuevo ancho del sidebar: 384px/96rem o 128px/32rem)
  const leftMargin = window.innerWidth >= 1024 
    ? (expanded ? "24rem" : "8rem") 
    : "0";

  return (
    <header 
      className="h-24 lg:h-36 fixed top-0 right-0 bg-white/95 backdrop-blur-xl border-b border-gray-200 z-40 transition-all duration-300 flex items-center justify-between px-6 md:px-10 lg:px-16 shadow-sm"
      style={{ left: leftMargin }}
    >
      <div className="flex items-center gap-6">
        <button onClick={toggleSidebar} className="lg:hidden p-3 text-gray-700 hover:bg-gray-100 rounded-2xl transition-colors">
          <Menu size={32} />
        </button>

        <div className="flex flex-col justify-center">
          <span className="hidden lg:block text-sm font-black text-gray-400 uppercase tracking-widest mb-1">
            Módulo Activo
          </span>
          <h2 className="text-2xl md:text-3xl lg:text-5xl font-black text-gray-900 uppercase tracking-tighter truncate leading-none">
            {title || "Panel Principal"}
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-6 md:gap-8 lg:gap-12">
        
        {/* NOTIFICACIONES */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={`
              relative p-3 lg:p-5 rounded-3xl transition-all duration-300 group
              ${showNotifications 
                ? "bg-blue-50 text-[#003366] shadow-inner ring-2 ring-blue-100" 
                : "hover:bg-gray-100 text-gray-500 hover:text-[#003366]"
              }
            `}
          >
            <Bell size={32} className="lg:w-10 lg:h-10 transition-transform group-hover:scale-110" />
            
            <span className="absolute top-3 right-3 lg:top-5 lg:right-5 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-[#CC0000] border-[3px] border-white"></span>
            </span>
          </button>

          {/* PANEL FLOTANTE (Ahora solo contiene la lista) */}
          {showNotifications && (
            <div className="absolute top-24 lg:top-32 right-[-80px] md:right-0 w-[360px] md:w-[500px] z-50 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="bg-white rounded-[2.5rem] shadow-2xl ring-1 ring-black/5 overflow-hidden border border-gray-100">
                <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/80 backdrop-blur-sm flex justify-between items-center">
                  <h3 className="font-black text-2xl text-gray-800">Avisos</h3>
                  <span className="text-xs font-black text-blue-600 bg-blue-100 px-4 py-1.5 rounded-full uppercase tracking-wider">
                    Recientes
                  </span>
                </div>
                
                <div className="max-h-[500px] overflow-y-auto custom-scrollbar bg-white p-4">
                  {/* Aquí carga el componente limpio que hicimos en el paso 1 */}
                  <NotificationCenter />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="h-16 w-px bg-gray-200 hidden md:block"></div>

        {/* PERFIL */}
        <div className="flex items-center gap-6 cursor-pointer group p-3 rounded-3xl hover:bg-gray-50 transition-all">
          <div className="text-right hidden md:block">
            <p className="text-lg lg:text-2xl font-black text-gray-800 leading-tight group-hover:text-[#003366] transition-colors">
              {displayName}
            </p>
            <p className="text-xs lg:text-base font-bold text-gray-400 uppercase tracking-widest mt-1">
              {displayRole}
            </p>
          </div>
          
          <div className="relative">
            <div className="w-14 h-14 lg:w-20 lg:h-20 rounded-full bg-gradient-to-br from-[#003366] to-blue-600 flex items-center justify-center text-white shadow-2xl shadow-blue-900/30 border-[5px] border-white ring-1 ring-gray-200 group-hover:scale-105 transition-transform duration-300">
              <User size={32} className="lg:w-10 lg:h-10" />
            </div>
            <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-[3px] border-white rounded-full"></div>
          </div>
        </div>
      </div>
    </header>
  );
}