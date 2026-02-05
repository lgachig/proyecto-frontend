import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/ui/Header';
import Sidebar from '../components/ui/Sidebar';
import { Loader2 } from 'lucide-react'; // Asegúrate de importar esto

export default function UserLayout() {
  const { user, profile, loading } = useAuth();

  // 1. Cargando inicial (Autenticación)
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 flex-col gap-4">
        <Loader2 className="animate-spin text-[#003366] w-12 h-12" />
        <p className="text-[#003366] font-bold animate-pulse">Cargando sistema...</p>
      </div>
    );
  }

  // 2. Si no hay usuario logueado -> Login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. Manejo de Roles:
  // Si es admin, lo mandamos a su layout
  if (profile?.role_id === 'r003') {
    return <Navigate to="/admin" replace />;
  }

  // 4. Fallback de Perfil:
  // Si profile es null (a veces pasa al crear cuenta nueva), usamos un default seguro.
  const safeProfile = profile || { role_id: 'r001', full_name: user.email };
  const role = safeProfile.role_id === 'r002' ? 'teacher' : 'student';

  return (
    <div className="relative min-h-screen bg-[#f4f7fa]">
      <Sidebar role={role} />
      <Header user={safeProfile} />

      {/* El RealtimeNotifier lo dejamos aquí solo si es necesario, 
          pero recuerda que el mapa ya tiene notificaciones */}
      
      <main className="pt-24 md:pt-32 md:ml-[15%] px-4 md:px-8 transition-all duration-300">
        <Outlet />
      </main>
    </div>
  );
}