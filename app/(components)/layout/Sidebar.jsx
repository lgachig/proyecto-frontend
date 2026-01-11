"use client";
import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import SidebarItem from "./SidebarItem";
import { supabase } from '@/lib/supabaseClient';
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
  const router = useRouter();
  const [userData, setUserData] = useState(null);

// 1. Obtain user data when loading the component
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserData(user.user_metadata);
      }
    };
    getUser();
  }, []);

  // 2. Logout function
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push('/login');
      router.refresh(); 
    } catch (error) {
      console.error('Error cerrando sesión:', error.message);
    }
  };

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: MapIcon, label: "Marking map", href: "/map" },
    { icon: BarChart3, label: "Statistics", href: "/statistics" },
    { icon: Settings, label: "Configuration", href: "/configuration" },
  ];

  return (
    <aside className="w-150 h-screen bg-parking-tertiary flex flex-col shadow-2xl border-r border-gray-100 font-inter">
      <div className="p-17 flex items-center justify-between">
        <div className="flex items-center">
          <img
            src="/logo.png" 
            alt="Smart Parking Logo"
            className="h-[100px] w-auto"
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

      
      <div className="p-12 border-t border-gray-100">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-6 px-17 py-6 text-parking-text-muted hover:text-red-500 transition-colors w-full group text-left"
        >
          <LogOut size={40} className="group-hover:translate-x-2 transition-transform" />
          <span className="text-3xl font-bold">Logout</span>
        </button>
      </div>
    </aside>
  );
}