"use client";
import { useEffect } from "react";
import { useAuth } from "../../../hooks/useAuth";
import Sidebar from "../../../components/ui/Sidebar";
import Header from "../../../components/ui/Header";

export default function AdminLayout({ children }) {
  const { user, profile, loading } = useAuth(); 

  useEffect(() => {
    if (!loading) {
      if (!user) {
        window.location.href = "/login";
      } else if (profile?.role_id !== 'r003') {
        // SI NO ES ADMIN, LO SACAMOS DE AQUÍ
        window.location.href = "/user";
      }
    }
  }, [user, profile, loading]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar role="admin" />
      <div className="flex-1 md:ml-64 flex flex-col">
        <Header user={profile} />
        <main className="p-6 flex-1">{children}</main>
      </div>
    </div>
  );
}