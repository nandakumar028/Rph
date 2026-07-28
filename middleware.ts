import { NextResponse, type NextRequest } from 'next/server'
// import { updateSession } from './src/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  // Bypassing Supabase middleware temporarily to isolate the Vercel crash
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
