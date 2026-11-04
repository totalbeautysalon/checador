"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Power, Loader2, Eye, EyeOff, Lock, User, Sparkles } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const res = await signIn("credentials", {
        email: username.trim(),
        password: password,
        redirect: false,
      });

      if (res?.error) {
        setError("Usuario o contraseña incorrectos. Verifica que los datos coincidan con Firebase.");
        setLoading(false);
      } else {
        // Redirección directa completa para sincronizar sesión en móviles y desktop
        window.location.href = "/admin/dashboard/checador";
      }
    } catch (err) {
      console.error(err);
      setError("Error al conectar con el servidor.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 sm:p-6 relative select-none pt-safe pb-safe">
      
      {/* Botón de cerrar para aplicación de escritorio (oculto en móviles) */}
      <button 
        type="button"
        onClick={() => { window.open('', '_self', ''); window.close(); }}
        className="hidden lg:flex absolute top-6 right-6 z-50 items-center gap-2 px-3.5 py-1.5 text-xs font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl transition-all shadow-sm cursor-pointer active:scale-95"
      >
        <Power className="w-4 h-4" /> Cerrar Pantalla
      </button>

      {/* Contenedor tipo App Card Nativa */}
      <div className="w-full max-w-sm sm:max-w-md bg-zinc-950/90 border border-zinc-850 p-6 sm:p-8 rounded-3xl shadow-2xl shadow-pink-950/20 backdrop-blur-xl">
        
        {/* Cabecera con Logo */}
        <div className="text-center mb-6 sm:mb-8 flex flex-col items-center">
          <div className="relative mb-3">
            <img 
              src="/images/logo.png" 
              alt="Total Beauty Logo" 
              className="h-14 sm:h-16 w-auto object-contain drop-shadow-lg" 
            />
            <div className="absolute -inset-1 bg-amber-500/10 blur-xl rounded-full -z-10" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 bg-clip-text text-transparent tracking-tight">
            Checador Digital
          </h1>
          <p className="text-pink-400 text-xs sm:text-sm mt-1 font-semibold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Total Beauty Salon y Academia
          </p>
        </div>

        {/* Mensaje de Error */}
        {error && (
          <div className="mb-5 p-3.5 bg-red-950/60 border border-red-500/40 text-red-200 rounded-2xl text-xs sm:text-sm text-center font-medium animate-shake">
            {error}
          </div>
        )}

        {/* Formulario de Login */}
        <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
          <div>
            <label className="block text-xs sm:text-sm font-bold text-amber-400 mb-1.5 uppercase tracking-wider">
              Correo o Usuario
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                inputMode="email"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ejemplo@totalbeauty.com o nombre"
                className="w-full pl-10 pr-4 py-3 sm:py-3.5 bg-black border border-zinc-800 text-white rounded-2xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition text-sm sm:text-base placeholder:text-zinc-600 shadow-inner"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-bold text-amber-400 mb-1.5 uppercase tracking-wider">
              Contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                autoCapitalize="none"
                autoCorrect="off"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-12 py-3 sm:py-3.5 bg-black border border-zinc-800 text-white rounded-2xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition text-sm sm:text-base placeholder:text-zinc-600 shadow-inner"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-500 hover:text-amber-400 transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 sm:py-4 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 active:scale-[0.98] text-black font-black text-sm sm:text-base rounded-2xl transition shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Verificando...</span>
              </>
            ) : (
              <span>Ingresar al Checador</span>
            )}
          </button>
        </form>

        <p className="text-center text-[11px] text-zinc-600 mt-6">
          © {new Date().getFullYear()} Total Beauty Salon y Academia
        </p>
      </div>
    </div>
  );
}
