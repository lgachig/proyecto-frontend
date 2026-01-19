"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../hooks/useAuth";
import Sidebar from "../../../components/ui/Sidebar";
import Header from "../../../components/ui/Header";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const { user, profile, loading } = useAuth(); 

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = "/login";
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 font-black italic text-[#003366]">
        CARGANDO SISTEMA UCE...
      </div>
    );
  }

  if (!user) return null;

  // Determinamos el rol para el Sidebar (r001=student, r002=teacher, r003=admin)
  const roleKey = profile?.role_id === 'r003' ? 'admin' : 
                  profile?.role_id === 'r002' ? 'teacher' : 'student';

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* 1. Sidebar Lateral */}
      <Sidebar role={roleKey} />

      {/* 2. Contenido Principal (con margen para el Sidebar) */}
      <div className="flex-1 md:ml-64 flex flex-col">
        {/* 3. Header Superior */}
        <Header user={profile || user} />

        {/* 4. Contenido de la Página (El Mapa) */}
        <main className="mt-16 p-4 h-[calc(100vh-64px)] overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}