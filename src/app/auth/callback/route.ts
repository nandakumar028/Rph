import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { createOrganization, updateUserProfile } from '@/utils/supabase/queries'

export async function GET(request: Request) {
  // The `/auth/callback` route is required for the server-side auth flow implemented
  // by the SSR package. It exchanges an auth code for the user's session.
  // https://supabase.com/docs/guides/auth/server-side/nextjs
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin
  const next = requestUrl.searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data?.user) {
      // Verify if the user profile has an associated organization.
      // If it doesn't (first time OAuth signup), provision one automatically.
      const { data: profile } = await supabase
        .from('profiles')
        .select('org_id')
        .eq('id', data.user.id)
        .single()

      if (!profile || !profile.org_id) {
        const email = data.user.email || 'OAuth User'
        const name = data.user.user_metadata?.full_name || email.split('@')[0]
        const subdomain = `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}-${Math.floor(Math.random() * 10000)}`
        
        const org = await createOrganization(supabase, `${name}'s Org`, subdomain)
        if (org) {
          await updateUserProfile(supabase, data.user.id, { org_id: org.id })
        }
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // return the user to an error page with some instructions
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
