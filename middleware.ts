import { NextResponse, type NextRequest } from 'next/server'

/**
 * Lightweight Edge-compatible middleware.
 *
 * @supabase/ssr uses Node.js crypto APIs that are not available in
 * Vercel's Edge sandbox, so we do NOT import it here.
 *
 * This middleware only does a fast cookie-existence check to redirect
 * unauthenticated users. The real, cryptographically-verified session
 * check happens inside each Server Component via createClient() from
 * @supabase/ssr, which runs in the Node.js runtime (not Edge).
 */

// Routes that do not require authentication
const PUBLIC_PATHS = ['/', '/login', '/signup', '/auth/']

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p)
  )
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Always allow public paths
  if (isPublicPath(pathname)) {
    return NextResponse.next()
  }

  // Check for any Supabase session cookie.
  // Supabase sets a cookie whose name contains "-auth-token".
  const cookies = request.cookies.getAll()
  const hasSession = cookies.some(
    (c) => c.name.includes('-auth-token') || c.name.startsWith('sb-')
  )

  if (!hasSession) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
