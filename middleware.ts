import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from './src/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  try {
    return await updateSession(request)
  } catch (error: any) {
    // If we catch the error, print it to the screen instead of letting Vercel eat it!
    return new NextResponse('Middleware crashed with error: ' + (error?.message || String(error)), { status: 500 })
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
