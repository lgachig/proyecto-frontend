import { supabase } from '../../lib/supabase';

export default function Header({ user }) {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 fixed top-0 right-0 left-0 md:left-64 z-30">
      <div className="text-sm font-bold text-gray-500 uppercase tracking-widest">
        Universidad Central del Ecuador
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-xs font-black text-gray-900 leading-none">{user?.full_name}</p>
          <p className="text-[10px] text-blue-600 font-bold uppercase">{user?.role_id}</p>
        </div>
        <button 
          onClick={() => supabase.auth.signOut()}
          className="bg-gray-100 p-2 rounded-full hover:bg-red-50 transition"
        >
          🚪
        </button>
        <div className="text-right mr-4">
          <p className="text-2xl font-black text-[#003366] leading-none uppercase italic">
            {user?.full_name}
          </p>
          <p className="text-sm font-bold text-[#CC0000] tracking-[0.2em] uppercase">
            {user?.role_id === 'r003' ? 'Administrador' : 
            user?.role_id === 'r002' ? 'Docente' : 'Estudiante'}
          </p>
        </div>
      </div>
    </header>
  );
}