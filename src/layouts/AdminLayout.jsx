import { Outlet } from "react-router-dom";
import Sidebar from "../components/ui/Sidebar";
import Header from "../components/ui/Header";
import { SidebarProvider, useSidebar } from "../contexts/SidebarContext";
import { useAuth } from "../hooks/useAuth";

function AdminLayoutContent() {
  const { expanded } = useSidebar();
  const { profile } = useAuth();

  const desktopMargin = expanded ? "20rem" : "7rem";

  return (
    <div className="min-h-screen animated-bg-light">
      <Sidebar role={profile?.role_id} />
      <Header title="Administración" />
      
      <main 
        className="pt-28 lg:pt-36 px-4 md:px-8 transition-all duration-300 ease-in-out pb-12"
        style={{ 
          marginLeft: window.innerWidth >= 1024 ? desktopMargin : "0px" 
        }}
      >
        <div className="max-w-[1600px] mx-auto w-full">
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