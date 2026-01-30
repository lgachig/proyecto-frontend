import { supabase } from '../../lib/supabase';
import NotificationCenter from './NotificationCenter';
import { useSidebar } from '../../contexts/SidebarContext';
import { Menu } from 'lucide-react';

/**
 * Top header with user info, notifications, and sidebar toggle for mobile.
 */
export default function Header({ user }) {
  const { toggle } = useSidebar();

  return (
    <header className="h-20 md:h-30 bg-white border-b border-gray-200 flex items-center justify-between gap-4 px-4 md:px-8 fixed top-0 right-0 left-0 md:left-[15%] z-30 shadow-sm">
      <button
        onClick={toggle}
        className="md:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100 text-[#003366] shrink-0"
        aria-label="Toggle menu"
      >
        <Menu size={28} />
      </button>
      <div className="hidden sm:block flex-1 min-w-0 text-xl md:text-3xl font-bold text-gray-500 uppercase tracking-widest truncate">
        Universidad Central del Ecuador
      </div>
      
      <div className="flex items-center gap-2 md:gap-10 flex-shrink-0"> 
        
        <div className="flex items-center">
            <NotificationCenter />
            <div className="h-12 md:h-16 w-[2px] bg-gray-100 mx-3 md:mx-6 hidden sm:block"></div> 
        </div>

        <div className="text-right mr-2 md:mr-4 min-w-0">
          <p className="text-xl md:text-4xl font-black text-[#003366] leading-none uppercase italic truncate">
            {user?.full_name}
          </p>
          <p className="text-base md:text-3xl font-bold text-[#CC0000] tracking-[0.1em] md:tracking-[0.2em] uppercase mt-1 truncate">
            {user?.role_id === 'r003' ? 'Administrador' : 
            user?.role_id === 'r002' ? 'Docente' : 'Estudiante'}
          </p>
        </div>

        <button 
          onClick={() => supabase.auth.signOut()}
          className="
            flex items-center justify-center
            w-14 h-14 md:w-20 md:h-20
            bg-red-50
            text-red-600
            rounded-full
            text-3xl md:text-5xl
            hover:bg-red-100
            hover:scale-110
            transition-all
            duration-200
            shadow-md
            shrink-0
          "
          title="Cerrar sesión"
        >
          🚪
        </button>
      </div>
    </header>
  );
}