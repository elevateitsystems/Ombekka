// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const { pathname } = request.nextUrl;

  // Admin routes protection
  if (pathname.startsWith('/admin-panel')) {
    if (!token) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    // You can add additional admin role check here
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin-panel/:path*'],
};