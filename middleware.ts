import { NextRequest, NextResponse } from 'next/server';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;

  console.log('path', path);

  // Define protected routes
  const isProtectedRoute = path.startsWith('/documents') || path.startsWith('/profile');

  // Check if the user is authenticated by looking for the session token
  const token =
    request.cookies.get('next-auth.session-token')?.value ||
    request.cookies.get('__Secure-next-auth.session-token')?.value;

  // If the route is protected and the user is not authenticated
  if (isProtectedRoute && !token) {
    // Redirect to the login page
    const url = new URL('/api/auth/signin', request.url);
    return NextResponse.redirect(url);
  }

  // Continue with the request
  return NextResponse.next();
}

// Configure the middleware to only run on specific paths
export const config = {
  matcher: ['/documents/:path*', '/profile/:path*'],
};
