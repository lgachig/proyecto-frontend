import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useSidebar } from "../../contexts/SidebarContext";
import {
  LayoutDashboard,
  CalendarCheck,
  MapPin,
  Car,
  BarChart3,
  LogOut,
  ChevronFirst,
  ChevronLast,
  FileText,
  X
} from "lucide-react";

export default function Sidebar({ role }) {
  const { expanded, toggleSidebar } = useSidebar();
  const location = useLocation();
  const { logout } = useAuth();

  const iconSize = 32; 

  const menus = {
    student: [
      { icon: <LayoutDashboard size={iconSize} />, text: "Inicio", path: "/user" },
      { icon: <CalendarCheck size={iconSize} />, text: "Mis Reservas", path: "/user/reservations" },
      { icon: <Car size={iconSize} />, text: "Mis Vehículos", path: "/user/vehicle" },
      { icon: <MapPin size={iconSize} />, text: "Mapa en Vivo", path: "/map" },
    ],
    teacher: [
      { icon: <LayoutDashboard size={iconSize} />, text: "Panel Docente", path: "/user" },
      { icon: <CalendarCheck size={iconSize} />, text: "Gestión Reservas", path: "/user/reservations" },
      { icon: <Car size={iconSize} />, text: "Vehículos", path: "/user/vehicle" },
      { icon: <MapPin size={iconSize} />, text: "Mapa del Campus", path: "/map" },
    ],
    admin: [
      { icon: <LayoutDashboard size={iconSize} />, text: "Dashboard", path: "/admin" },
      { icon: <MapPin size={iconSize} />, text: "Gestión Puestos", path: "/admin/slots" },
      { icon: <FileText size={iconSize} />, text: "Reportes PDF", path: "/admin/reports" },
      { icon: <BarChart3 size={iconSize} />, text: "Estadísticas", path: "/admin/statics" },
    ],
  };

  const currentMenu = role === 'r003' ? menus.admin : (role === 'r002' ? menus.teacher : menus.student);

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/60 z-40 lg:hidden transition-opacity duration-300 backdrop-blur-sm ${expanded ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={toggleSidebar}
      />

      <aside 
        className={`
          h-screen fixed top-0 left-0 bg-white border-r border-gray-200 z-50 transition-all duration-300 ease-in-out flex flex-col shadow-2xl lg:shadow-xl
          ${expanded ? "w-[280px] lg:w-96 translate-x-0" : "w-[280px] -translate-x-full lg:translate-x-0 lg:w-32"}
        `}
      >
        <div className="h-24 lg:h-36 flex items-center justify-between px-6 lg:px-10 border-b border-gray-100">
          <div className={`flex items-center gap-5 overflow-hidden transition-all ${expanded ? "opacity-100" : "lg:opacity-0 lg:w-0"}`}>
            <img src="/logo.png" alt="UCE" className="w-12 h-12 lg:w-16 lg:h-16 object-contain" />
            <div className="flex flex-col">
              <span className="font-black text-[#003366] text-xl lg:text-3xl leading-none">UCE</span>
              <span className="text-xs lg:text-sm font-black text-gray-400 uppercase tracking-[0.2em] mt-1">Parking</span>
            </div>
          </div>
          
          <button 
            onClick={toggleSidebar} 
            className="p-3 lg:p-4 rounded-2xl bg-blue-50 text-[#003366] hover:bg-blue-100 transition-colors lg:block hidden shadow-sm"
          >
            {expanded ? <ChevronFirst size={28} /> : <ChevronLast size={28} />}
          </button>

          <button onClick={toggleSidebar} className="lg:hidden p-2 text-gray-500">
            <X size={28} />
          </button>
        </div>

        <ul className="flex-1 px-4 lg:px-8 py-8 lg:py-12 space-y-4 lg:space-y-6 overflow-y-auto custom-scrollbar">
          {currentMenu.map((item, index) => {
            const isActive = location.pathname === item.path;
            
            return (
              <li key={index}>
                <Link
                  to={item.path}
                  onClick={() => window.innerWidth < 1024 && toggleSidebar()}
                  className={`
                    relative flex items-center py-4 lg:py-6 px-4 lg:px-6 font-bold rounded-2xl cursor-pointer transition-all group
                    ${isActive 
                      ? "bg-[#003366] text-white shadow-xl shadow-blue-900/20 scale-105" 
                      : "text-gray-500 hover:bg-blue-50 hover:text-[#003366] hover:scale-105"
                    }
                  `}
                >
                  <div className={`transition-all duration-300 ${!expanded && "lg:mx-auto lg:scale-110"}`}>{item.icon}</div>
                  
                  <span className={`
                    overflow-hidden transition-all duration-300 whitespace-nowrap text-base lg:text-xl tracking-tight
                    ${expanded ? "w-64 ml-5 opacity-100" : "w-0 ml-0 opacity-0 lg:hidden"}
                  `}>
                    {item.text}
                  </span>

                  {!expanded && (
                    <div className="hidden lg:block absolute left-full top-1/2 -translate-y-1/2 rounded-xl px-5 py-4 ml-6 bg-[#003366] text-white text-lg font-bold invisible opacity-0 translate-x-[-10px] group-hover:visible group-hover:opacity-100 group-hover:translate-x-0 transition-all z-50 whitespace-nowrap shadow-2xl">
                      {item.text}
                    </div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="p-4 lg:p-8 border-t border-gray-100 pb-8 lg:pb-12 bg-gray-50/50">
          <button
            onClick={logout}
            className={`
              w-full flex items-center py-4 lg:py-5 px-4 lg:px-6 rounded-2xl font-black transition-all
              text-red-500 hover:bg-red-50 hover:text-red-600 hover:shadow-lg
              ${!expanded && "lg:justify-center"}
            `}
          >
            <LogOut size={32} />
            <span className={`overflow-hidden transition-all duration-300 text-sm lg:text-lg uppercase tracking-wider ${expanded ? "w-auto ml-5 opacity-100" : "w-0 ml-0 opacity-0 lg:hidden"}`}>
              Salir
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}