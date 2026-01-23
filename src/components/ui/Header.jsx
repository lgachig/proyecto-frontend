// components/ui/Header.jsx
import { supabase } from '../../lib/supabase';
import NotificationCenter from './NotificationCenter';

export default function Header({ user }) {
  return (
    <header className="h-30 bg-white border-b border-gray-200 flex items-center justify-between px-8 fixed top-0 right-0 left-0 md:left-[15%] z-30 shadow-sm">
      <div className="text-3xl font-bold text-gray-500 uppercase tracking-widest">
        Universidad Central del Ecuador
      </div>
      
      <div className="flex items-center gap-10"> {/* Aumenté el gap a 10 */}
        
        {/* CENTRO DE NOTIFICACIONES */}
        <div className="flex items-center">
            <NotificationCenter />
            <div className="h-16 w-[2px] bg-gray-100 mx-6"></div> {/* Separador vertical */}
        </div>

        <div className="text-right mr-4">
          <p className="text-4xl font-black text-[#003366] leading-none uppercase italic">
            {user?.full_name}
          </p>
          <p className="text-3xl font-bold text-[#CC0000] tracking-[0.2em] uppercase mt-1">
            {user?.role_id === 'r003' ? 'Administrador' : 
            user?.role_id === 'r002' ? 'Docente' : 'Estudiante'}
          </p>
        </div>

        <button 
          onClick={() => supabase.auth.signOut()}
          className="
            flex items-center justify-center
            w-20 h-20
            bg-red-50
            text-red-600
            rounded-full
            text-5xl
            hover:bg-red-100
            hover:scale-110
            transition-all
            duration-200
            shadow-md
          "
          title="Cerrar sesión"
        >
          🚪
        </button>
      </div>
    </header>
  );
}