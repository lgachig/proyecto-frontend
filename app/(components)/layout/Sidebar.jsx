"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import SidebarItem from "./SidebarItem";
import { 
  LayoutDashboard, 
  Map as MapIcon, 
  BarChart3, 
  Settings, 
  LogOut,
  X 
} from 'lucide-react';

export default function Sidebar({ onClose }) {
  const pathname = usePathname();

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: MapIcon, label: "Marking map", href: "/map" },
    { icon: BarChart3, label: "Statistics", href: "/statistics" },
    { icon: Settings, label: "Configuration", href: "/configuration" },
  ];

  return (
    <aside className="w-150 h-screen bg-parking-tertiary flex flex-col shadow-2xl border-r border-gray-100 font-inter">
      
      {/* Header del Sidebar con Logo y Nombre Grande */}
      <div className="p-17 flex items-center justify-between">
        <div className="flex items-center">
          <img
            src="./logo.png"
            alt="Smart Parking Logo"
            className="h-[100px] w-auto" // Logo más grande para acompañar los textos
          />

          <div className="flex flex-col leading-none p-5">
            <span className="font-bold text-black text-4xl md:text-5xl m-0">
              Smart Parking
            </span>
            <span className="font-semibold text-parking-primary text-3xl md:text-4xl -mt-1">
              UCE
            </span>
          </div>
        </div>

        {onClose && (
          <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-gray-600">
            <X size={50} />
          </button>
        )}
      </div>

      {/* Navegación Principal con espaciado px-17 */}
      <nav className="flex-1 px-17 space-y-6">
        {menuItems.map((item) => (
          <SidebarItem 
            key={item.href}
            icon={item.icon} 
            label={item.label} 
            href={item.href}
            active={pathname === item.href} 
          />
        ))}
      </nav>

      {/* Logout con texto text-3xl */}
      <div className="p-12 border-t border-gray-100">
        <Link href="/login"> 
          <button className="flex items-center gap-6 px-17 py-6 text-parking-text-muted hover:text-red-500 transition-colors w-full group">
            <LogOut size={40} className="group-hover:translate-x-2 transition-transform" />
            <span className="text-3xl font-bold">Logout</span>
          </button>
        </Link>
      </div>
    </aside>
  );
}