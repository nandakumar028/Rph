import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

/**
 * OAuth callback handler for the Supabase SSR auth flow.
 *
 * Flow:
 *   1. GitHub redirects the user here with a one-time ?code=
 *   2. We exchange the code for a Supabase session.
 *   3. If the user's profile has no org_id yet (first OAuth sign-up),
 *      we provision an org and link it — mirroring what the DB trigger
 *      does for email/password signups.
 *   4. Redirect to /dashboard (or a ?next= override).
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code       = requestUrl.searchParams.get('code')
  const origin     = requestUrl.origin
  // Allow a safe ?next= redirect but restrict to relative paths only
  const rawNext    = requestUrl.searchParams.get('next') ?? '/dashboard'
  const next       = rawNext.startsWith('/') ? rawNext : '/dashboard'

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data?.user) {
    console.error('[auth/callback] exchangeCodeForSession error:', error?.message)
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
  }

  // Check if the DB trigger already provisioned an org (email signup path).
  // For OAuth first-time signups the trigger fires too, but we verify anyway.
  const { data: profile } = await supabase
    .from('profiles')
    .select('org_id')
    .eq('id', data.user.id)
    .single()

  if (!profile?.org_id) {
    // Provision an org for this OAuth user
    const email = data.user.email ?? 'oauthuser'
    const fullName = (data.user.user_metadata?.full_name as string | undefined) ?? email.split('@')[0]
    const safeName = fullName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'org'
    const subdomain = `${safeName}-${Math.floor(Math.random() * 10_000)}`

    const { data: org } = await supabase
      .from('organizations')
      .insert([{ name: `${fullName}'s Org`, subdomain }])
      .select('id')
      .single()

    if (org) {
      await supabase
        .from('profiles')
        .update({ org_id: org.id })
        .eq('id', data.user.id)
    }
  }

  return NextResponse.redirect(`${origin}${next}`)
}
