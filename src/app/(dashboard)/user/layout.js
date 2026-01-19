"use client";
import { useEffect } from "react";
import { useAuth } from "../../../hooks/useAuth";
import Sidebar from "../../../components/ui/Sidebar";
import Header from "../../../components/ui/Header";

export default function DashboardLayout({ children }) {
  const { user, profile, loading } = useAuth(); 

  useEffect(() => {
    if (!loading) {
      if (!user) {
        window.location.href = "/login";
      } else if (profile?.role_id === 'r003') {
        window.location.href = "/admin"; 
      }
    }
  }, [user, profile, loading]);

  if (loading || (user && profile?.role_id === 'r003')) {
    return (
      <div className="h-screen flex items-center justify-center bg-white font-black text-[#003366]">
        REDIRECCIONANDO...
      </div>
    );
  }

  const roleKey = profile?.role_id === 'r002' ? 'teacher' : 'student';

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role={roleKey} />
      <div className="flex-1 md:ml-64 flex flex-col">
        <Header user={profile} />
        <main className="p-4 flex-1">{children}</main>
      </div>
    </div>
  );
}