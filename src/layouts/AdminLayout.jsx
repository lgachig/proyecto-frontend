import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/ui/Header';
import Sidebar from '../components/ui/Sidebar';
import RealtimeNotifier from '../components/ui/RealtimeNotifier';

export default function AdminLayout() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center font-black text-[#003366]">
        <p>Cargando...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!profile) {
    return (
      <div className="flex h-screen items-center justify-center font-black text-[#003366]">
        <p>Cargando perfil...</p>
      </div>
    );
  }

  if (profile.role_id !== 'r003') {
    return <Navigate to="/user" replace />;
  }

  return (
    <div className="relative min-h-screen">
      <Sidebar role="admin" />
      <Header user={profile} />

      <div className="fixed inset-0 pointer-events-none z-[99999]">
        <RealtimeNotifier />
      </div>

      <main className="pt-32 md:ml-[15%] px-8">
        <Outlet />
      </main>
    </div>
  );
}
