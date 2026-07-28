import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Guard: if Supabase environment variables are missing, do not initialize client
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return supabaseResponse
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Do not remove this getUser() call.
  // It is required to refresh the session token if it is expired.
  const { data: { user } } = await supabase.auth.getUser()

  // Define routes that do not require authentication
  const isAuthRoute =
    request.nextUrl.pathname === '/' ||
    request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/signup') ||
    request.nextUrl.pathname.startsWith('/auth/')

  // ── Unauthenticated user → login ─────────────────────────────────────────
  // We must copy the Supabase session cookies onto every redirect response.
  // Without this, the PKCE verifier cookie set by updateSession() would be
  // lost and the next request would start a brand-new anonymous session.
  if (!user && !isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    const redirectResponse = NextResponse.redirect(url)

    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, {
        domain:   cookie.domain,
        path:     cookie.path,
        maxAge:   cookie.maxAge,
        httpOnly: cookie.httpOnly,
        secure:   cookie.secure,
        // sameSite is typed as string on RequestCookies but the
        // ResponseCookies setter requires the narrower union type.
        sameSite: cookie.sameSite as 'lax' | 'strict' | 'none' | boolean | undefined,
      })
    })

    return redirectResponse
  }

  // ── Authenticated user → dashboard (skip login/signup) ───────────────────
  if (user && (
    request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/signup')
  )) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    const redirectResponse = NextResponse.redirect(url)

    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, {
        domain:   cookie.domain,
        path:     cookie.path,
        maxAge:   cookie.maxAge,
        httpOnly: cookie.httpOnly,
        secure:   cookie.secure,
        sameSite: cookie.sameSite as 'lax' | 'strict' | 'none' | boolean | undefined,
      })
    })

    return redirectResponse
  }

  return supabaseResponse
}
