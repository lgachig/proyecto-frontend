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
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: value.email,
          password: value.password,
        });
        
        if (data?.user) {
          const { data: prof } = await supabase
            .from('profiles')
            .select('role_id')
            .eq('id', data.user.id)
            .single();
        
          if (prof?.role_id === 'r003') {
            window.location.href = '/admin';
          } else {
            window.location.href = '/user';
          }
        }
    
      } catch (err) {
        alert("Error: " + err.message);
      }
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-xl w-full bg-white rounded-[3rem] shadow-[0_20px_50px_rgba(0,51,102,0.15)] overflow-hidden border-b-[12px] border-[#003366]">
        
        <div className="p-10 md:p-14">
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
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
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
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
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