"use client";
import { useForm } from '@tanstack/react-form';
import { supabase } from '../../../lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
      fullName: '',
      licensePlate: '',
      vehicleModel: '',
    },onSubmit: async ({ value }) => {
      try {
        // 1. Registro en AUTH (Incluyendo el nombre en metadatos)
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: value.email,
          password: value.password,
          options: {
            data: {
              full_name: value.fullName, // Se guarda en metadatos de Auth
            }
          }
        });
    
        if (authError) throw authError;
    
        // 2. Registro en tu tabla PROFILES (Donde me mostraste que sale NULL)
        // Aquí es donde realmente "vive" el usuario para tu aplicación
        const { error: profileError } = await supabase.from('profiles').upsert({
          id: authData.user.id,
          full_name: value.fullName,       // NOMBRE EXACTO DE TU COLUMNA
          institutional_id: value.instId,  // TU NUEVA COLUMNA UCE-XXXX
          role_id: 'r001',                 // ID de estudiante
          is_active: true,
          updated_at: new Date().toISOString(),
        });
    
        if (profileError) throw profileError;
    
        alert("¡Registro exitoso! Ya puedes ver tu nombre en la tabla.");
        router.push('/user');
    
      } catch (error) {
        alert("Error: " + error.message);
      }
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4 md:p-10">
      <div className="max-w-5xl w-full bg-white rounded-[4rem] shadow-[0_40px_80px_rgba(0,51,102,0.1)] overflow-hidden border-b-[16px] border-[#003366]">
        
        <div className="p-12 md:p-20">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 border-b-4 border-gray-50 pb-10">
            <div>
              <h1 className="text-6xl font-black text-[#003366] tracking-tighter italic uppercase leading-none">
                Nuevo <span className="text-[#CC0000]">Usuario</span>
              </h1>
              <p className="text-xl font-bold text-gray-400 mt-4 tracking-widest uppercase">
                Registro Vehicular UCE
              </p>
            </div>
            <div className="hidden md:flex w-24 h-24 bg-[#003366] rounded-[2rem] items-center justify-center shadow-2xl rotate-6">
              <span className="text-white text-5xl font-black italic">P</span>
            </div>
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); form.handleSubmit(); }}
            className="space-y-12"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
              
              {/* SECCIÓN PERSONAL */}
              <div className="space-y-8">
                <h2 className="text-2xl font-black text-[#003366] uppercase tracking-tight flex items-center gap-3">
                  <span className="w-3 h-10 bg-[#003366] rounded-full inline-block"></span>
                  Datos de Cuenta
                </h2>
                
                <form.Field name="fullName">
                  {(field) => (
                    <div className="space-y-3">
                      <label className="text-lg font-black text-gray-400 uppercase ml-2 tracking-tighter">Nombre y Apellido</label>
                      <input
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="w-full p-7 bg-gray-50 rounded-[2rem] border-4 border-transparent focus:border-[#003366] text-2xl font-bold transition-all outline-none"
                        placeholder="Ej: Marco Vinicio"
                      />
                    </div>
                  )}
                </form.Field>

                <form.Field name="email">
                  {(field) => (
                    <div className="space-y-3">
                      <label className="text-lg font-black text-gray-400 uppercase ml-2 tracking-tighter">Correo Institucional</label>
                      <input
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="w-full p-7 bg-gray-50 rounded-[2rem] border-4 border-transparent focus:border-[#003366] text-2xl font-bold transition-all outline-none"
                        placeholder="nombre@uce.edu.ec"
                      />
                    </div>
                  )}
                </form.Field>

                <form.Field name="password">
                  {(field) => (
                    <div className="space-y-3">
                      <label className="text-lg font-black text-gray-400 uppercase ml-2 tracking-tighter">Contraseña</label>
                      <input
                        type="password"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="w-full p-7 bg-gray-50 rounded-[2rem] border-4 border-transparent focus:border-[#003366] text-2xl font-bold transition-all outline-none"
                        placeholder="••••••••••••"
                      />
                    </div>
                  )}
                </form.Field>
              </div>

              {/* SECCIÓN VEHÍCULO */}
              <div className="space-y-8">
                <h2 className="text-2xl font-black text-[#CC0000] uppercase tracking-tight flex items-center gap-3">
                  <span className="w-3 h-10 bg-[#CC0000] rounded-full inline-block"></span>
                  Tu Vehículo
                </h2>

                <form.Field name="licensePlate">
                  {(field) => (
                    <div className="space-y-3">
                      <label className="text-lg font-black text-gray-400 uppercase ml-2 tracking-tighter">Placa (Única)</label>
                      <input
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="w-full p-7 bg-gray-50 rounded-[2rem] border-4 border-transparent focus:border-[#CC0000] text-2xl font-bold transition-all outline-none uppercase"
                        placeholder="PDF-0000"
                      />
                    </div>
                  )}
                </form.Field>

                <form.Field name="vehicleModel">
                  {(field) => (
                    <div className="space-y-3">
                      <label className="text-lg font-black text-gray-400 uppercase ml-2 tracking-tighter">Modelo / Marca</label>
                      <input
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="w-full p-7 bg-gray-50 rounded-[2rem] border-4 border-transparent focus:border-[#CC0000] text-2xl font-bold transition-all outline-none"
                        placeholder="Ej: Kia Sportage"
                      />
                    </div>
                  )}
                </form.Field>

                <form.Field name="instId">
                  {(field) => (
                    <div className="space-y-3">
                      <label className="text-lg font-black text-gray-400 uppercase ml-2 tracking-tighter">
                        ID Institucional (SIIU)
                      </label>
                      <input
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="w-full p-7 bg-gray-50 rounded-[2rem] border-4 border-transparent focus:border-[#003366] text-2xl font-bold transition-all outline-none"
                        placeholder="Ej: UCE-2024-XXXX"
                      />
                    </div>
                  )}
                </form.Field>

                <div className="p-8 bg-[#003366]/5 rounded-[2.5rem] border-2 border-[#003366]/10">
                  <p className="text-sm font-black text-[#003366] uppercase italic leading-tight">
                    💡 IMPORTANTE: Solo se permite un vehículo por usuario para garantizar el espacio de todos.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#003366] hover:bg-[#002244] text-white text-3xl font-black py-8 rounded-[2.5rem] shadow-2xl shadow-[#003366]/40 transition-all transform active:scale-[0.97] uppercase tracking-tighter"
            >
              FINALIZAR REGISTRO
            </button>
          </form>

          <div className="mt-16 text-center">
            <p className="text-xl font-bold text-gray-400 uppercase tracking-tighter">
              ¿Ya tienes cuenta?{' '}
              <Link href="/login" className="text-[#CC0000] font-black underline decoration-4 underline-offset-8">
                INGRESA AQUÍ
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}