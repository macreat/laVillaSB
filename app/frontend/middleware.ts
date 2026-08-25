import { NextRequest, NextResponse } from 'next/server';

// This is a UX gate only; gateway auth:sanctum plus EnsureAdmin enforce security.
export function middleware(request: NextRequest) {
  const hasSession = request.cookies.has('lavilla_session');
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin') && !hasSession) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (pathname === '/login' && hasSession) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/login'],
};
