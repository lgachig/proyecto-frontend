"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Map, Calendar, Car, BarChart3, Receipt, Settings, User } from 'lucide-react';

export default function Sidebar({ role }) {
  const pathname = usePathname();

  const menuItems = {
    admin: [
      { name: 'Dashboard', href: '/admin', icon: <BarChart3 size={20} /> },
      { name: 'Reportes', href: '/admin/reports', icon: <Receipt size={20} /> },
      { name: 'Gestión Slots', href: '/admin/slots', icon: <Settings size={20} /> },
    ],
    student: [
      { name: 'Mapa Parqueadero', href: '/user', icon: <Map size={20} /> },
      { name: 'Mis Reservas', href: '/user/reservations', icon: <Calendar size={20} /> },
      { name: 'Mi Vehículo', href: '/user/vehicle', icon: <Car size={20} /> },
    ],
    teacher: [
      { name: 'Mapa Priority', href: '/user/map', icon: <Map size={20} /> },
      { name: 'Mi Perfil', href: '/user/profile', icon: <User size={20} /> },
    ]
  };

  const currentMenu = menuItems[role] || menuItems.student;

  return (
    <aside className="w-64 h-screen bg-[#001529] text-white p-6 hidden md:block fixed left-0 top-0 shadow-2xl z-50">
      <div className="mb-10 px-2">
        <div className="text-2xl font-black tracking-tighter italic text-white">
          UCE <span className="text-blue-500">SMART</span>
        </div>
        <div className="text-[10px] font-bold text-blue-300/50 uppercase tracking-[0.3em]">
          Parking System
        </div>
      </div>

      <nav className="space-y-2">
        {currentMenu.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.name} 
              href={item.href} 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <span className={`${isActive ? 'text-white' : 'text-gray-500 group-hover:text-blue-400'}`}>
                {item.icon}
              </span>
              <span className="font-bold text-sm tracking-tight">{item.name}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_white]"></div>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-10 left-6 right-6">
        <div className="p-4 bg-gray-800/50 rounded-2xl border border-gray-700">
          <p className="text-[10px] font-black text-gray-500 uppercase">Rol Actual</p>
          <p className="text-xs font-bold text-blue-400 uppercase italic">{role}</p>
        </div>
      </div>
    </aside>
  );
}