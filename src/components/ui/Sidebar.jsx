import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useSidebar } from "../../contexts/SidebarContext";
import {
  LayoutDashboard, CalendarCheck, MapPin, Car, BarChart3,
  LogOut, ChevronFirst, ChevronLast, FileText, X
} from "lucide-react";

export default function Sidebar({ role }) {
  const { expanded, toggleSidebar } = useSidebar();
  const location = useLocation();
  const { logout } = useAuth();

  const iconSize = 24; 

  const menus = {
    admin: [
      { icon: <LayoutDashboard size={iconSize} />, text: "Dashboard", path: "/admin" },
      { icon: <MapPin size={iconSize} />, text: "Puestos", path: "/admin/slots" },
      { icon: <FileText size={iconSize} />, text: "Reportes", path: "/admin/reports" },
      { icon: <BarChart3 size={iconSize} />, text: "Estadísticas", path: "/admin/statics" },
    ],
    student: [
      { icon: <LayoutDashboard size={iconSize} />, text: "Inicio", path: "/user" },
      { icon: <CalendarCheck size={iconSize} />, text: "Reservas", path: "/user/reservations" },
      { icon: <Car size={iconSize} />, text: "Vehículos", path: "/user/vehicle" },
      { icon: <MapPin size={iconSize} />, text: "Mapa", path: "/map" },
    ],
    teacher: [
      { icon: <LayoutDashboard size={iconSize} />, text: "Inicio", path: "/user" },
      { icon: <CalendarCheck size={iconSize} />, text: "Reservas", path: "/user/reservations" },
      { icon: <Car size={iconSize} />, text: "Vehículos", path: "/user/vehicle" },
      { icon: <MapPin size={iconSize} />, text: "Mapa", path: "/map" },
    ],
  };

  const currentMenu = role === 'r003' ? menus.admin : (role === 'r002' ? menus.teacher : menus.student);
  
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1280;

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/60 z-[60] transition-opacity duration-300 backdrop-blur-sm 
          ${isMobile && expanded ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={toggleSidebar}
      />

      <aside 
        className={`
          h-screen fixed top-0 left-0 bg-white border-r border-gray-200 z-[70] transition-all duration-300 ease-in-out flex flex-col shadow-2xl xl:shadow-xl
          ${expanded ? "translate-x-0 w-[260px] xl:w-80" : "-translate-x-full xl:translate-x-0 xl:w-28"}
        `}
      >
        <div className="h-20 xl:h-32 flex items-center justify-between px-6 xl:px-8 border-b border-gray-100">
          <div className={`flex items-center gap-3 overflow-hidden transition-all ${expanded ? "opacity-100" : "xl:opacity-0 xl:w-0"}`}>
            <img src="/logo.png" alt="UCE" className="w-8 h-8 xl:w-14 xl:h-14 object-contain" />
            <div className="flex flex-col">
              <span className="font-black text-[#003366] text-lg xl:text-2xl leading-none">UCE</span>
              <span className="text-[10px] xl:text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Parking</span>
            </div>
          </div>
          
          <button 
            onClick={toggleSidebar} 
            className="p-3 rounded-2xl bg-blue-50 text-[#003366] hover:bg-blue-100 transition-colors hidden xl:block"
          >
            {expanded ? <ChevronFirst size={26} /> : <ChevronLast size={26} />}
          </button>

          <button onClick={toggleSidebar} className="xl:hidden p-2 text-gray-500 bg-gray-50 rounded-lg">
            <X size={24} />
          </button>
        </div>

        <ul className="flex-1 px-4 xl:px-6 py-6 space-y-2 xl:space-y-4 overflow-y-auto custom-scrollbar">
          {currentMenu.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={index}>
                <Link
                  to={item.path}
                  onClick={() => isMobile && toggleSidebar()}
                  className={`
                    relative flex items-center py-3 xl:py-5 px-4 xl:px-5 font-bold rounded-2xl cursor-pointer transition-all group
                    ${isActive 
                      ? "bg-[#003366] text-white shadow-lg shadow-blue-900/30 scale-105" 
                      : "text-gray-500 hover:bg-blue-50 hover:text-[#003366] hover:scale-105"
                    }
                  `}
                >
                  <div className={`transition-all duration-300 ${!expanded && "xl:mx-auto xl:scale-110"}`}>{item.icon}</div>
                  <span className={`overflow-hidden transition-all duration-300 whitespace-nowrap text-sm xl:text-base tracking-wide ${expanded ? "w-48 ml-4 opacity-100" : "w-0 ml-0 opacity-0 xl:hidden"}`}>
                    {item.text}
                  </span>
                  
                  {!expanded && !isMobile && (
                    <div className="hidden xl:block absolute left-full top-1/2 -translate-y-1/2 rounded-xl px-4 py-2 ml-5 bg-[#003366] text-white text-sm font-bold invisible opacity-0 translate-x-[-10px] group-hover:visible group-hover:opacity-100 group-hover:translate-x-0 transition-all z-50 whitespace-nowrap shadow-xl">
                      {item.text}
                    </div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="p-4 xl:p-6 border-t border-gray-100 pb-6 xl:pb-10 bg-gray-50/50">
          <button onClick={logout} className={`w-full flex items-center py-3 px-4 rounded-2xl font-bold transition-all text-red-500 hover:bg-red-50 hover:text-red-600 ${!expanded && "xl:justify-center"}`}>
            <LogOut size={24} />
            <span className={`overflow-hidden transition-all duration-300 text-sm xl:text-base ${expanded ? "w-auto ml-4 opacity-100" : "w-0 ml-0 opacity-0 xl:hidden"}`}>Salir</span>
          </button>
        </div>
      </aside>
    </>
  );
}