import { useState, useEffect } from "react";
import { Outlet, Navigate } from "react-router-dom";
import Sidebar from "../components/ui/Sidebar";
import Header from "../components/ui/Header";
import { SidebarProvider, useSidebar } from "../contexts/SidebarContext";
import { useAuth } from "../hooks/useAuth";
import { Loader2 } from "lucide-react";

function AdminLayoutContent() {
  const auth = useAuth();
  const { profile, user: authUser, loading: authLoading } = auth;

  const [isDesktop, setIsDesktop] = useState(
    typeof window !== "undefined" ? window.innerWidth >= 1280 : false
  );

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1280);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f8fafc] flex-col gap-4">
        <Loader2 className="animate-spin text-[#003366] w-12 h-12" />
        <p className="text-[#003366] font-bold animate-pulse">Cargando...</p>
      </div>
    );
  }
  if (!authUser) return <Navigate to="/login" replace />;
  if (profile?.role_id !== "r003") return <Navigate to="/user" replace />;

  const desktopMargin = "18rem";

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Sidebar role={profile?.role_id} />
      <Header title="Administración" variant="admin" />
      <main
        className="pt-20 xl:pt-32 px-4 md:px-8 pb-12 transition-all duration-300 ease-in-out w-full"
        style={{
          marginLeft: isDesktop ? desktopMargin : "0",
          width: isDesktop ? `calc(100% - ${desktopMargin})` : "100%",
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