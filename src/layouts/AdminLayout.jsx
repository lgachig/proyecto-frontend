import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/ui/Sidebar";
import Header from "../components/ui/Header";
import { SidebarProvider, useSidebar } from "../contexts/SidebarContext";
import { useAuth } from "../hooks/useAuth";

function AdminLayoutContent() {
  const { expanded } = useSidebar();
  const { profile } = useAuth();
  
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= 1280 : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1280);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const desktopMargin = expanded ? "20rem" : "7rem"; 

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Sidebar role={profile?.role_id} />
      <Header title="Administración" />
      
      <main 
        className="pt-24 lg:pt-36 px-4 md:px-8 pb-12 transition-all duration-300 ease-in-out w-full"
        style={{ 
          marginLeft: isDesktop ? desktopMargin : "0px",
          width: isDesktop ? `calc(100% - ${desktopMargin})` : "100%"
        }}
      >
        <div className="max-w-[1920px] mx-auto w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default function AdminLayout() {
  return (
    <SidebarProvider>
      <AdminLayoutContent />
    </SidebarProvider>
  );
}