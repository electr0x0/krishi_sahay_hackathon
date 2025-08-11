import { NextRequest, NextResponse } from 'next/server';

// Define protected routes
const protectedRoutes = ['/dashboard', '/chat', '/assistant', '/settings', '/profile'];

// Define auth routes (should redirect to dashboard if already authenticated)
const authRoutes = ['/auth/login', '/auth/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth_token')?.value;

  // Handle CORS for all API routes
  if (pathname.startsWith('/api')) {
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
          'Access-Control-Allow-Headers': '*',
          'Access-Control-Allow-Credentials': 'true',
          'Access-Control-Max-Age': '86400',
        },
      });
    }
  }

  // Check if it's a protected route
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  // Check if it's an auth route
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  // If accessing protected route without token, redirect to home
  if (isProtectedRoute && !token) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    url.searchParams.set('auth', 'required');
    return NextResponse.redirect(url);
  }

  // If accessing auth route with token, redirect to dashboard
  if (isAuthRoute && token) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/dashboard/chat/:path*',
    '/assistant/:path*',
    '/settings/:path*',
    '/profile/:path*',
    '/auth/:path*'
  ]
};