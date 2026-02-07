import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { Loader2, AlertCircle, Mail, Lock, Car, MapPin, ShieldCheck } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { loginSchema } from '../utils/authSchemas';

export default function LoginPage() {
  const { user, signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [authError, setAuthError] = useState(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  if (user) return <Navigate to="/user" replace />;

  const onSubmit = async (data) => {
    setAuthError(null);
    try {
      await signIn(data.email, data.password);
      navigate('/user'); 
    } catch (error) {
      setAuthError(
        error.message === "Invalid login credentials"
          ? "Credenciales incorrectas."
          : error.message
      );
    }
  };

  const handleGoogleLogin = async () => {
    setAuthError(null);
    setIsGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      setAuthError("Error al conectar con Google.");
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center animated-bg p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-[#CC0000] rounded-full blur-[180px] opacity-20 animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#003366] rounded-full blur-[200px] opacity-30 animate-pulse delay-1000"></div>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 glass-panel rounded-[2.5rem] overflow-hidden shadow-2xl relative z-10 min-h-[650px]">
        <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-[#003366]/40 to-transparent text-white">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <img src="/logo.png" alt="Logo" className="h-12" />
              <span className="font-bold tracking-widest text-sm uppercase">Facultad de Ingeniería</span>
            </div>
            <h1 className="text-5xl font-black leading-tight mb-6">
              Gestión Inteligente <br />
              de <span className="text-blue-200">Espacios</span>
            </h1>
            <p className="text-lg text-white/80 max-w-md">
              Bienvenido a <strong>UCE Smart Parking</strong>. Optimiza tu tiempo en tiempo real.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <Car className="text-blue-300 mb-2" size={28} />
              <p className="text-xs font-bold">Monitoreo</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <MapPin className="text-red-300 mb-2" size={28} />
              <p className="text-xs font-bold">Ubicación</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <ShieldCheck className="text-green-300 mb-2" size={28} />
              <p className="text-xs font-bold">Seguridad</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center p-8 md:p-16 bg-white/5 backdrop-blur-xl">
          <h2 className="text-3xl font-black text-white mb-2">Iniciar Sesión</h2>
          <p className="text-white/50 mb-8">Usa tus credenciales institucionales.</p>

          {authError && (
            <div className="mb-6 p-4 bg-red-500/20 border-l-4 border-red-500 text-white text-sm flex gap-3 items-center">
              <AlertCircle size={20} className="text-red-400" /> {authError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <input
              {...register("email")}
              type="email"
              placeholder="usuario@uce.edu.ec"
              className="w-full p-4 rounded-xl bg-white/80 text-black outline-none"
            />
            <input
              {...register("password")}
              type="password"
              placeholder="••••••••"
              className="w-full p-4 rounded-xl bg-white/80 text-black outline-none"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-white text-[#003366] rounded-xl font-black uppercase tracking-widest hover:bg-blue-50 transition-all"
            >
              {isSubmitting ? <Loader2 className="animate-spin mx-auto" /> : "ACCEDER"}
            </button>
          </form>

          <div className="relative my-8 text-center text-xs uppercase text-white/40">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <span className="relative px-3 bg-[#1a1a1a]">O continúa con</span>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
            className="w-full py-3.5 bg-white/5 border border-white/10 text-white rounded-xl font-bold flex items-center justify-center gap-3"
          >
            {isGoogleLoading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  className="w-5 h-5"
                />
                Google Institucional
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}