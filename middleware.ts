import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from './src/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  try {
    return await updateSession(request)
  } catch (error: unknown) {
    const err = error as Error
    return new NextResponse('Middleware crashed with error: ' + (err?.message || String(error)), { status: 500 })
  }
}
