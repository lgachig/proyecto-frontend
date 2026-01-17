"use client";
import Sidebar from "../../../components/ui/Sidebar";
import Header from "../../../components/ui/Header";
import { useAuth } from "../../../hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({ children }) {
  const { profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !profile) {
      router.push("/login");
    }
  }, [profile, loading, router]);

  if (loading) return <div className="h-screen flex items-center justify-center font-black italic">CARGANDO SISTEMA...</div>;

  return (
    <div className="flex min-h-screen">
      <Sidebar role={profile?.role_id} />
      <div className="flex-1 md:ml-64">
        <Header user={profile} />
        <main className="p-6 mt-16">
          {children}
        </main>
      </div>
    </div>
  );
}