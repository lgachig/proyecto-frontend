"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Map, Calendar, Car, BarChart3, Receipt, Settings, User } from 'lucide-react';

export default function Sidebar({ role }) {
  const pathname = usePathname();

  const menuItems = {
    admin: [
      { name: 'Dashboard', href: '/admin', icon: <BarChart3 size={24} /> },
      { name: 'Reportes', href: '/admin/reports', icon: <Receipt size={24} /> },
      { name: 'Gestión Slots', href: '/admin/slots', icon: <Settings size={24} /> },
    ],
    student: [
      { name: 'Mapa Parqueadero', href: '/user', icon: <Map size={24} /> },
      { name: 'Mis Reservas', href: '/user/reservations', icon: <Calendar size={24} /> },
      { name: 'Mi Vehículo', href: '/user/vehicle', icon: <Car size={24} /> },
    ],
    teacher: [
      { name: 'Mapa Priority', href: '/user/map', icon: <Map size={24} /> },
      { name: 'Mi Perfil', href: '/user/profile', icon: <User size={24} /> },
    ]
  };

  const currentMenu = menuItems[role] || menuItems.student;

  return (
    <aside className="w-[15%] h-screen bg-[#001529] text-white p-6 hidden md:block fixed left-0 top-0 shadow-2xl z-50">
      <div className="mb-10 px-2">
        <div className="text-4xl font-black tracking-tighter italic text-white">
          UCE <span className="text-blue-500">SMART</span>
        </div>
        <div className="text-[20px] font-bold text-blue-300/50 uppercase tracking-[0.3em] mt-2">
          Parking System
        </div>
      </div>

      <nav className="space-y-3">
        {currentMenu.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.name} 
              href={item.href} 
              className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <span className={`${isActive ? 'text-white' : 'text-gray-500 group-hover:text-blue-400'}`}>
                {item.icon}
              </span>
              <span className="font-black text-xl tracking-tight uppercase">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-10 left-6 right-6">
        <div className="p-4 bg-gray-800/50 rounded-2xl border border-gray-700">
          <p className="text-2xl font-black text-gray-500 uppercase">Rol Actual</p>
          <p className="text-xl font-bold text-blue-400 uppercase italic">{role}</p>
        </div>
      </div>
    </aside>
  );
}