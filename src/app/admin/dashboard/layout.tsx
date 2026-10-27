"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut, SessionProvider } from "next-auth/react";
import { Monitor, Clock, History, Settings, Power } from "lucide-react";
import toast from "react-hot-toast";

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);

    let timeoutId: NodeJS.Timeout;
    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        signOut({ callbackUrl: '/admin/login' });
      }, 600000); 
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(name => document.addEventListener(name, resetTimer, true));
    resetTimer();

    return () => {
      window.removeEventListener("resize", checkMobile);
      clearTimeout(timeoutId);
      events.forEach(name => document.removeEventListener(name, resetTimer, true));
    };
  }, []);

  if (isMobile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white p-6 text-center">
        <div>
          <Monitor className="w-12 h-12 mb-4 mx-auto text-pink-500" />
          <h1 className="text-2xl font-bold mb-2 text-amber-500">Acceso Restringido</h1>
          <p className="text-zinc-400 mb-6">
            Por motivos de seguridad y visualización, el panel de administración solo está disponible desde una computadora de escritorio o laptop.
          </p>
          <Link href="/" className="px-6 py-3 bg-amber-600 rounded-md font-medium inline-block text-black">
            Volver al Inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden flex bg-black font-sans text-zinc-300 relative">
      {/* Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-40" 
          onClick={() => setIsSidebarOpen(false)} 
        />
      )}
      
      {/* Sidebar Administrativo */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-zinc-950 text-zinc-400 flex flex-col shadow-2xl shadow-pink-900/10 border-r border-zinc-900 transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-zinc-900 bg-black flex flex-col items-center">
          <img src="/images/logo.png" alt="Total Beauty" className="h-12 w-auto mb-2" />
          <p className="text-[10px] font-semibold text-pink-500 uppercase tracking-[0.2em]">Checador</p>
        </div>
        <nav className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-1">
          <Link onClick={() => setIsSidebarOpen(false)} href="/admin/dashboard/checador" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${pathname === '/admin/dashboard/checador' ? 'bg-amber-500/10 text-amber-500' : 'hover:bg-zinc-900 hover:text-pink-400'}`}>
            <Clock className="w-5 h-5" />
            <span className="font-medium text-sm">Checador de Asistencia</span>
          </Link>

          {session?.user?.role === 'admin' ? (
            <>
              <Link onClick={() => setIsSidebarOpen(false)} href="/admin/dashboard/asistencias" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${pathname === '/admin/dashboard/asistencias' ? 'bg-amber-500/10 text-amber-500' : 'hover:bg-zinc-900 hover:text-pink-400'}`}>
                <History className="w-5 h-5" />
                <span className="font-medium text-sm">Quincena Actual</span>
              </Link>
              <Link onClick={() => setIsSidebarOpen(false)} href="/admin/dashboard/historial-quincenas" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${pathname === '/admin/dashboard/historial-quincenas' ? 'bg-amber-500/10 text-amber-500' : 'hover:bg-zinc-900 hover:text-pink-400'}`}>
                <History className="w-5 h-5" />
                <span className="font-medium text-sm">Historial de Quincenas</span>
              </Link>
              <Link onClick={() => setIsSidebarOpen(false)} href="/admin/dashboard/configuracion" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${pathname === '/admin/dashboard/configuracion' ? 'bg-amber-500/10 text-amber-500' : 'hover:bg-zinc-900 hover:text-pink-400'}`}>
                <Settings className="w-5 h-5" />
                <span className="font-medium text-sm">Configuración</span>
              </Link>
            </>
          ) : (
            <>
              <button onClick={() => { setIsSidebarOpen(false); toast.error("Acceso denegado: Solo gerencia puede ingresar a esta sección."); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition hover:bg-zinc-900 hover:text-pink-400 text-zinc-500">
                <History className="w-5 h-5" />
                <span className="font-medium text-sm">Quincena Actual</span>
              </button>
              <button onClick={() => { setIsSidebarOpen(false); toast.error("Acceso denegado: Solo gerencia puede ingresar a esta sección."); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition hover:bg-zinc-900 hover:text-pink-400 text-zinc-500">
                <History className="w-5 h-5" />
                <span className="font-medium text-sm">Historial de Quincenas</span>
              </button>
              <button onClick={() => { setIsSidebarOpen(false); toast.error("Acceso denegado: Solo gerencia puede ingresar a esta sección."); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition hover:bg-zinc-900 hover:text-pink-400 text-zinc-500">
                <Settings className="w-5 h-5" />
                <span className="font-medium text-sm">Configuración</span>
              </button>
            </>
          )}
        </nav>
        <div className="p-4 border-t border-zinc-900 bg-black">
          <div className="flex items-center gap-3 px-4 pb-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-pink-700 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-pink-500/30">
              {session?.user?.name?.charAt(0) || "U"}
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-200 leading-tight">{session?.user?.name}</p>
              <p className="text-[10px] text-amber-500">{session?.user?.role === 'admin' ? 'Administrador' : 'Trabajadora'}</p>
            </div>
          </div>
          <button 
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
            className="w-full px-4 py-2 text-left text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 rounded-md transition flex items-center gap-3 cursor-pointer">
            <span className="font-medium text-sm">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-black w-full">
        {/* Header Superior con Hamburguesa */}
        <div className="h-16 shrink-0 border-b border-zinc-900 bg-black flex items-center justify-between px-4">
          <div className="flex items-center">
            <button 
              onClick={() => setIsSidebarOpen(true)} 
              className="p-2 text-amber-500 hover:text-pink-500 hover:bg-zinc-900 rounded-lg transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <img src="/images/logo.png" alt="Logo" className="h-8 w-auto ml-4" />
          </div>
          
          <button 
            onClick={() => { 
              signOut({ redirect: false });
              setTimeout(() => {
                window.open('', '_self', ''); 
                window.close();
              }, 150);
            }}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-red-500 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition-colors shadow-sm cursor-pointer z-50"
          >
            <Power className="w-4 h-4" /> Cerrar Pantalla
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </main>
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
  )
}
