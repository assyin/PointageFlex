import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes publiques qui ne nécessitent pas d'authentification
const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Vérifier si la route est publique
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // Redirection automatique de la racine vers login
  // (La vérification de l'authentification sera faite côté client)
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Continuer normalement - la protection des routes se fera côté client
  // avec le AuthContext et les composants de layout
  return NextResponse.next();
}

// Configuration du matcher pour spécifier les routes à protéger
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
