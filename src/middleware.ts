import { auth } from "@/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAuthRoute = req.nextUrl.pathname.startsWith('/admin/login');
  const isAdminDashboard = req.nextUrl.pathname.startsWith('/admin/dashboard');

  if (isAuthRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL('/admin/dashboard', req.nextUrl));
    }
    return;
  }

  if (isAdminDashboard) {
    if (!isLoggedIn) {
      return Response.redirect(new URL('/admin/login', req.nextUrl));
    }
    
    const user = req.auth?.user as any;
    const role = user?.role || "";

    const path = req.nextUrl.pathname;
    
    // Solo los admin pueden entrar a la página de asistencias, configuracion y historial-quincenas
    if ((path.includes('/asistencias') || path.includes('/configuracion') || path.includes('/historial-quincenas')) && role !== 'admin') {
      return Response.redirect(new URL('/admin/dashboard/checador', req.nextUrl));
    }
  }
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images).*)'],
};
