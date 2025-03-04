import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { withAuth } from 'next-auth/middleware'

export default withAuth(
  async function middleware(req) {
    const token = await getToken({ req })
    const isAuth = !!token
    const isAuthPage = req.nextUrl.pathname.startsWith('/auth')
    const isProtectedRoute = req.nextUrl.pathname.startsWith('/(auth)')

    // Redirect to login if accessing protected route without auth
    if (!isAuth && isProtectedRoute) {
      return NextResponse.redirect(
        new URL(`/auth/signin?callbackUrl=${encodeURIComponent(req.url)}`, req.url)
      )
    }

    // Redirect to documents if accessing auth page while logged in
    if (isAuth && isAuthPage) {
      return NextResponse.redirect(new URL('/documents', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

// Specify which routes should be protected
export const config = {
  matcher: [
    // Protected routes that need authentication
    '/(auth)/:path*',
    // Auth pages
    '/auth/:path*',
  ],
} 