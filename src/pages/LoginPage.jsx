import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { Loader2, AlertCircle, Mail, Lock, Car, MapPin, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabase'; // IMPORTACIÓN DIRECTA (La clave para que funcione)
import { useAuth } from '../hooks/useAuth';
import { loginSchema } from '../utils/authSchemas';

export default function LoginPage() {
  const { user, signIn } = useAuth();
  const navigate = useNavigate();
  const [authError, setAuthError] = useState(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // 1. Redirección si ya está logueado (Igual que en tu código funcional)
  if (user) return <Navigate to="/user" replace />;

  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting } 
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  // 2. Login con Correo (Usando useAuth como tenías)
  const onSubmit = async (data) => {
    setAuthError(null);
    try {
      await signIn(data.email, data.password);
      // La navegación la maneja el estado 'user' o esta línea
      navigate('/user'); 
    } catch (error) {
      let msg = error.message;
      if (msg?.includes("Invalid login")) msg = "Credenciales incorrectas.";
      if (msg?.includes("Email not confirmed")) msg = "Confirma tu correo electrónico.";
      setAuthError(msg || "Error al iniciar sesión.");
    }
  };

  // 3. Login con Google (LÓGICA DIRECTA QUE SÍ FUNCIONA)
  const handleGoogleLogin = async () => {
    setAuthError(null);
    setIsGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // Redirige directo a /user
          redirectTo: `${window.location.origin}/user`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      
      if (error) throw error;
      // No seteamos loading false porque redirige
    } catch (error) {
      console.error(error);
      setAuthError("Error al conectar con Google.");
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center animated-bg p-4 relative overflow-hidden">
      
      {/* --- AQUÍ COMIENZA TU DISEÑO GLASS ORIGINAL --- */}
      
      {/* Fondos Decorativos Animados */}
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-[#CC0000] rounded-full blur-[180px] opacity-20 animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#003366] rounded-full blur-[200px] opacity-30 animate-pulse delay-1000"></div>

      {/* TARJETA PRINCIPAL */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 glass-panel rounded-[2.5rem] overflow-hidden shadow-2xl relative z-10 min-h-[650px] animate-in zoom-in duration-500">
        
        {/* COLUMNA IZQUIERDA: INFORMACIÓN */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-[#003366]/40 to-transparent text-white relative">
          <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-10 mix-blend-overlay"></div>
          
          <div>
            <div className="flex items-center gap-3 mb-8">
              <img src="/logo.png" alt="Logo" className="h-12 drop-shadow-lg" />
              <span className="font-bold tracking-widest text-sm opacity-80 uppercase">Facultad de Ingeniería</span>
            </div>
            
            <h1 className="text-5xl font-black leading-tight mb-6">
              Gestión Inteligente <br/> de <span className="text-blue-200">Espacios</span>
            </h1>
            
            <p className="text-lg text-white/80 leading-relaxed max-w-md">
              Bienvenido al sistema <strong>UCE Smart Parking</strong>. Optimiza tu tiempo encontrando estacionamiento en tiempo real.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-12">
            <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
              <Car className="text-blue-300 mb-2" size={28} />
              <p className="text-xs font-bold text-white/90">Monitoreo Real</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
              <MapPin className="text-red-300 mb-2" size={28} />
              <p className="text-xs font-bold text-white/90">Ubicación Exacta</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
              <ShieldCheck className="text-green-300 mb-2" size={28} />
              <p className="text-xs font-bold text-white/90">Acceso Seguro</p>
            </div>
          </div>

          <div className="text-xs text-white/40 mt-8">
            © 2026 Universidad Central del Ecuador
          </div>
        </div>

        {/* COLUMNA DERECHA: FORMULARIO */}
        <div className="flex flex-col justify-center p-8 md:p-16 bg-white/5 backdrop-blur-xl relative">
          
          <div className="mb-10">
            <h2 className="text-3xl font-black text-white mb-2">Iniciar Sesión</h2>
            <p className="text-white/50">Ingresa tus credenciales institucionales.</p>
          </div>

          {authError && (
            <div className="mb-6 p-4 bg-red-500/20 border-l-4 border-red-500 rounded-r-lg flex items-center gap-3 text-white text-sm backdrop-blur-md animate-in slide-in-from-left-2">
              <AlertCircle size={20} className="text-red-400 shrink-0" />
              <span className="font-medium">{authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/70 uppercase tracking-wider ml-1">Correo Institucional</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-white transition-colors" size={20} />
                <input
                  {...register("email")}
                  type="email"
                  placeholder="usuario@uce.edu.ec"
                  className="w-full pl-12 pr-4 py-4 rounded-xl glass-input text-base text-black bg-white/80 focus:bg-white transition-all outline-none"
                />
              </div>
              {errors.email && <p className="text-xs text-red-400 font-medium ml-1">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-white/70 uppercase tracking-wider ml-1">Contraseña</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40 group-focus-within:text-black transition-colors" size={20} />
                <input
                  {...register("password")}
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 rounded-xl glass-input text-base text-black bg-white/80 focus:bg-white transition-all outline-none"
                />
              </div>
              {errors.password && <p className="text-xs text-red-400 font-medium ml-1">{errors.password.message}</p>}
            </div>

            <div className="flex items-center justify-end">
              <Link to="/forgot-password" className="text-sm font-medium text-blue-200 hover:text-white transition-colors hover:underline">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-white text-[#003366] rounded-xl font-black uppercase tracking-widest hover:bg-blue-50 active:scale-95 transition-all shadow-xl shadow-black/20 flex items-center justify-center gap-3 text-sm"
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : "ACCEDER AL SISTEMA"}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="px-3 text-white/40 bg-transparent font-bold">O continúa con</span></div>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
            className="w-full py-3.5 bg-white/5 border border-white/10 text-white rounded-xl font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-3 backdrop-blur-sm"
          >
            {isGoogleLoading ? <Loader2 className="animate-spin" size={20} /> : (
              <>
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                <span className="text-sm">Google Institucional</span>
              </>
            )}
          </button>

          <div className="mt-8 text-center">
            <p className="text-white/50 text-sm">
              ¿Aún no tienes cuenta?{' '}
              <Link to="/register" className="font-bold text-white hover:text-blue-200 transition-colors ml-1">
                Solicita tu acceso aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}