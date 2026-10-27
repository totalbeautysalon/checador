"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

import { Power } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    const res = await signIn("credentials", {
      email: username,
      password: password,
      redirect: false,
    });

    if (res?.error) {
      setError("Usuario o contraseña incorrectos");
    } else {
      router.push("/admin/dashboard/checador");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative">
      <button 
        onClick={() => { window.open('', '_self', ''); window.close(); }}
        className="absolute top-6 right-6 z-50 flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-500 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl transition-colors shadow-sm cursor-pointer"
      >
        <Power className="w-4 h-4" /> Cerrar Pantalla
      </button>

      <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-2xl shadow-pink-900/20 w-full max-w-md">
        <div className="text-center mb-8 flex flex-col items-center">
          <img src="/images/logo.png" alt="Total Beauty Logo" className="h-16 w-auto mb-4" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">Checador de Asistencia</h1>
          <p className="text-pink-400 mt-2 font-medium">Ingresa tus credenciales para registrarte</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-500/50 text-red-200 rounded-md text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-amber-500 mb-1">Correo Electrónico</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-black border border-zinc-700 text-white rounded-md focus:ring-amber-500 focus:border-amber-500 outline-none transition"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-amber-500 mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-black border border-zinc-700 text-white rounded-md focus:ring-amber-500 focus:border-amber-500 outline-none transition"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold rounded-md hover:from-amber-400 hover:to-amber-500 transition shadow-lg shadow-amber-500/20"
          >
            Iniciar Sesión
          </button>
        </form>
      </div>
    </div>
  );
}
