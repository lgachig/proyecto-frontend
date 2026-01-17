"use client";
import { useForm } from '@tanstack/react-form';
import { supabase } from '../../../lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();

  const form = useForm({
    defaultValues: { email: '', password: '' },
    onSubmit: async ({ value }) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: value.email,
        password: value.password,
      });
    
      if (error) return alert("Error: " + error.message);
    
      // Consultamos el perfil para obtener el role_id real (r001, r002, r003)
      const { data: profile } = await supabase
        .from('profiles')
        .select('role_id')
        .eq('id', data.user.id)
        .single();
    
      // Redirección basada en tus IDs de la base de datos
      if (profile?.role_id === 'r003') {
        router.push('/admin'); // Si es r003 va a la carpeta admin
      } else if (profile?.role_id === 'r002') {
        router.push('/user'); // Maestro (puedes crear /teacher si prefieres)
      } else {
        router.push('/user'); // Estudiante r001 va a /user
      }
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      {/* Contenedor Principal más grande (max-w-xl) */}
      <div className="max-w-xl w-full bg-white rounded-[3rem] shadow-[0_20px_50px_rgba(0,51,102,0.15)] overflow-hidden border-b-[12px] border-[#003366]">
        
        <div className="p-10 md:p-14">
          {/* Header del Formulario */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-[#003366] rounded-3xl shadow-lg mb-6 transform -rotate-3">
              <span className="text-white text-4xl font-black italic">P</span>
            </div>
            <h1 className="text-4xl font-black text-[#003366] uppercase tracking-tighter italic leading-none">
              UCE <span className="text-[#CC0000]">Parking</span>
            </h1>
            <p className="text-gray-400 font-bold uppercase text-xs tracking-[0.2em] mt-3">
              Sistema Inteligente de Guía
            </p>
          </div>

          {/* Formulario con TanStack Form */}
          <form
            onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); form.handleSubmit(); }}
            className="space-y-8"
          >
            <form.Field name="email">
              {(field) => (
                <div className="space-y-3">
                  <label className="block text-sm font-black uppercase text-gray-500 ml-2 tracking-widest">
                    Correo Institucional
                  </label>
                  <input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="w-full p-6 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-[#003366] focus:bg-white text-lg font-medium transition-all outline-none shadow-inner"
                    placeholder="usuario@uce.edu.ec"
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="password">
              {(field) => (
                <div className="space-y-3">
                  <label className="block text-sm font-black uppercase text-gray-500 ml-2 tracking-widest">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="w-full p-6 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-[#003366] focus:bg-white text-lg font-medium transition-all outline-none shadow-inner"
                    placeholder="••••••••••••"
                  />
                </div>
              )}
            </form.Field>

            <div className="flex justify-end">
              <button type="button" className="text-[#CC0000] font-bold text-sm hover:underline italic">
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <button
              type="submit"
              className="w-full bg-[#003366] hover:bg-[#002244] text-white text-xl font-black py-6 rounded-2xl shadow-xl shadow-blue-900/20 transition-all transform active:scale-[0.97] uppercase tracking-widest"
            >
              Iniciar Sesión
            </button>
          </form>

          {/* Footer del Componente */}
          <div className="mt-12 pt-8 border-t border-gray-100 text-center">
            <p className="text-gray-500 font-medium">
              ¿Eres nuevo en la plataforma?{' '}
              <Link href="/register" className="text-[#CC0000] font-black hover:underline ml-1">
                REGÍSTRATE AQUÍ
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}