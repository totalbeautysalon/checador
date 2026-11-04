"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut, SessionProvider } from "next-auth/react";
import { Clock, History, Settings, Power, LogOut, Camera, Calendar, Menu, X } from "lucide-react";
import toast from "react-hot-toast";

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        signOut({ callbackUrl: '/admin/login' });
      }, 600000); // 10 minutos de inactividad
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(name => document.addEventListener(name, resetTimer, true));
    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      events.forEach(name => document.removeEventListener(name, resetTimer, true));
    };
  }, []);

  const isAdmin = session?.user?.role === 'admin';
  const userName = session?.user?.name || "Colaboradora";

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/admin/login' });
  };

  return (
    <div className="min-h-screen bg-black font-sans text-zinc-300 flex flex-col relative select-none">
      {/* ============================================================== */}
      {/* 📱 TOP BAR MÓVIL (Estilo App Nativa)                          */}
      {/* ============================================================== */}
      <header className="lg:hidden sticky top-0 z-30 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-850 px-4 py-2.5 flex items-center justify-between shadow-lg shadow-black/50 pt-safe">
        <div className="flex items-center gap-3">
          <img src="/images/logo.png" alt="Total Beauty" className="h-8 w-auto object-contain" />
          <div className="leading-tight">
            <h1 className="text-sm font-black bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
              Total Beauty
            </h1>
            <p className="text-[10px] text-zinc-400 font-medium">
              Hola, <span className="text-pink-400 font-bold">{userName}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full">
              Admin
            </span>
          )}
          <button
            onClick={handleLogout}
            title="Cerrar Sesión"
            className="p-2 rounded-xl text-zinc-400 hover:text-red-400 hover:bg-red-500/10 active:scale-95 transition border border-transparent hover:border-red-500/20"
          >
            <LogOut className="w-4 h-4 text-red-400" />
          </button>
        </div>
      </header>

      {/* ============================================================== */}
      {/* 💻 SIDEBAR ESCRITORIO                                          */}
      {/* ============================================================== */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden" 
          onClick={() => setIsSidebarOpen(false)} 
        />
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Administrativo (Desktop y Drawer) */}
        <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-zinc-950 text-zinc-400 flex flex-col shadow-2xl border-r border-zinc-850 transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
          <div className="p-6 border-b border-zinc-900 bg-black flex flex-col items-center relative">
            <button 
              onClick={() => setIsSidebarOpen(false)} 
              className="lg:hidden absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <img src="/images/logo.png" alt="Total Beauty" className="h-12 w-auto mb-2" />
            <p className="text-[11px] font-bold text-pink-500 uppercase tracking-[0.25em]">Checador</p>
          </div>

          <nav className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-1">
            <Link 
              onClick={() => setIsSidebarOpen(false)} 
              href="/admin/dashboard/checador" 
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition font-medium text-sm ${pathname === '/admin/dashboard/checador' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold shadow-md shadow-amber-500/10' : 'hover:bg-zinc-900 hover:text-pink-400'}`}
            >
              <Clock className="w-5 h-5" />
              <span>Checador de Asistencia</span>
            </Link>

            {isAdmin ? (
              <>
                <Link 
                  onClick={() => setIsSidebarOpen(false)} 
                  href="/admin/dashboard/asistencias" 
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition font-medium text-sm ${pathname === '/admin/dashboard/asistencias' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold shadow-md shadow-amber-500/10' : 'hover:bg-zinc-900 hover:text-pink-400'}`}
                >
                  <Calendar className="w-5 h-5" />
                  <span>Quincena Actual</span>
                </Link>
                <Link 
                  onClick={() => setIsSidebarOpen(false)} 
                  href="/admin/dashboard/historial-quincenas" 
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition font-medium text-sm ${pathname === '/admin/dashboard/historial-quincenas' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold shadow-md shadow-amber-500/10' : 'hover:bg-zinc-900 hover:text-pink-400'}`}
                >
                  <History className="w-5 h-5" />
                  <span>Historial de Quincenas</span>
                </Link>
                <Link 
                  onClick={() => setIsSidebarOpen(false)} 
                  href="/admin/dashboard/configuracion" 
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition font-medium text-sm ${pathname === '/admin/dashboard/configuracion' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold shadow-md shadow-amber-500/10' : 'hover:bg-zinc-900 hover:text-pink-400'}`}
                >
                  <Settings className="w-5 h-5" />
                  <span>Configuración</span>
                </Link>
              </>
            ) : null}
          </nav>

          <div className="p-4 border-t border-zinc-900 bg-black">
            <div className="flex items-center gap-3 px-3 pb-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-pink-500 to-amber-500 flex items-center justify-center text-black font-black text-sm shadow-md shadow-pink-500/30">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-zinc-100 truncate">{userName}</p>
                <p className="text-[10px] text-amber-400 font-semibold">{isAdmin ? 'Administrador' : 'Colaboradora'}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full px-4 py-2.5 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition flex items-center gap-2.5 font-medium text-xs cursor-pointer border border-transparent hover:border-red-500/20 active:scale-95"
            >
              <LogOut className="w-4 h-4 text-red-400" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </aside>

        {/* ============================================================== */}
        {/* 🖥️ ÁREA PRINCIPAL DE CONTENIDO                                */}
        {/* ============================================================== */}
        <main className="flex-1 flex flex-col min-h-0 bg-black w-full overflow-hidden">
          {/* Header Superior Desktop */}
          <div className="hidden lg:flex h-16 shrink-0 border-b border-zinc-900 bg-black items-center justify-between px-6">
            <div className="flex items-center gap-3">
              <img src="/images/logo.png" alt="Logo" className="h-8 w-auto" />
              <span className="text-amber-500 font-bold text-sm tracking-wide">Checador Digital</span>
            </div>
            
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl transition-all shadow-sm cursor-pointer active:scale-95"
            >
              <Power className="w-4 h-4" /> Cerrar Sesión
            </button>
          </div>
          
          {/* Contenedor del contenido con scroll independiente */}
          <div className="flex-1 overflow-y-auto custom-scrollbar pb-safe-nav lg:pb-6">
            {children}
          </div>
        </main>
      </div>

      {/* ============================================================== */}
      {/* 📱 TAB BAR NATIVO INFERIOR (Solo en Pantallas Móviles)           */}
      {/* ============================================================== */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-850 px-2 py-1.5 flex items-center justify-around shadow-2xl pb-safe">
        {/* Tab: Checador */}
        <Link
          href="/admin/dashboard/checador"
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition active:scale-90 ${
            pathname === '/admin/dashboard/checador'
              ? 'text-amber-400 font-bold'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <div className={`p-1.5 rounded-xl transition ${pathname === '/admin/dashboard/checador' ? 'bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30' : ''}`}>
            <Clock className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5">Checador</span>
        </Link>

        {isAdmin && (
          <>
            {/* Tab: Quincena Actual */}
            <Link
              href="/admin/dashboard/asistencias"
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition active:scale-90 ${
                pathname === '/admin/dashboard/asistencias'
                  ? 'text-amber-400 font-bold'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <div className={`p-1.5 rounded-xl transition ${pathname === '/admin/dashboard/asistencias' ? 'bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30' : ''}`}>
                <Calendar className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5">Quincena</span>
            </Link>

            {/* Tab: Historial */}
            <Link
              href="/admin/dashboard/historial-quincenas"
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition active:scale-90 ${
                pathname === '/admin/dashboard/historial-quincenas'
                  ? 'text-amber-400 font-bold'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <div className={`p-1.5 rounded-xl transition ${pathname === '/admin/dashboard/historial-quincenas' ? 'bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30' : ''}`}>
                <History className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5">Historial</span>
            </Link>

            {/* Tab: Configuración */}
            <Link
              href="/admin/dashboard/configuracion"
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition active:scale-90 ${
                pathname === '/admin/dashboard/configuracion'
                  ? 'text-amber-400 font-bold'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <div className={`p-1.5 rounded-xl transition ${pathname === '/admin/dashboard/configuracion' ? 'bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30' : ''}`}>
                <Settings className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5">Ajustes</span>
            </Link>
          </>
        )}

        {/* Tab: Salir */}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center justify-center py-1 px-3 rounded-2xl text-zinc-500 hover:text-red-400 active:scale-90 transition"
        >
          <div className="p-1.5 rounded-xl">
            <Power className="w-5 h-5 text-red-400" />
          </div>
          <span className="text-[10px] mt-0.5">Salir</span>
        </button>
      </nav>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </SessionProvider>
  );
}
