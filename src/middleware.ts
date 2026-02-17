import { auth } from '@/lib/auth';
import { incrementHttpRequests } from '@/lib/metrics/counters';
import { NextResponse } from 'next/server';

// Routes that don't require authentication
const publicRoutes = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/api/auth',
  '/api/health',
  '/api/ready',
  '/api/metrics',
  '/verify',
];

// Routes that are always public (static assets, etc.)
const alwaysPublicPrefixes = [
  '/_next',
  '/favicon.ico',
  '/api/auth',
];

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Count every request that passes through middleware
  incrementHttpRequests(req.method);

  // Root route: public landing page for guests, dashboard for logged-in users
  if (pathname === '/') {
    if (req.auth?.user) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    return NextResponse.next();
  }

  // Allow always-public routes
  for (const prefix of alwaysPublicPrefixes) {
    if (pathname.startsWith(prefix)) {
      return NextResponse.next();
    }
  }

  // Allow public routes
  if (publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))) {
    return NextResponse.next();
  }

  // Check if user is authenticated
  const isAuthenticated = !!req.auth?.user;

  if (!isAuthenticated) {
    // Redirect to login with callback URL
    const loginUrl = new URL('/auth/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
