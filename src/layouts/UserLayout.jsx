import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/ui/Header';
import Sidebar from '../components/ui/Sidebar';
import { Loader2 } from 'lucide-react';

export default function UserLayout() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 flex-col gap-4">
        <Loader2 className="animate-spin text-[#003366] w-12 h-12" />
        <p className="text-[#003366] font-bold animate-pulse">Cargando sistema...</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (profile?.role_id === 'r003') return <Navigate to="/admin" replace />;

  const safeProfile = profile || { role_id: 'r001', full_name: user.email };
  const role = safeProfile.role_id === 'r002' ? 'teacher' : 'student';

  return (
    <div className="relative min-h-screen bg-[#f4f7fa] flex flex-col">
      <Sidebar role={role} />
      <div className="flex-1 flex flex-col min-w-0 w-full transition-all duration-300 xl:ml-72 xl:w-[calc(100%-18rem)]">
        <Header user={safeProfile} variant="user" />
        <main className="flex-1 px-4 md:px-8 pb-8 pt-20 xl:pt-32">
          <Outlet />
        </main>
      </div>
    </div>
  );
}