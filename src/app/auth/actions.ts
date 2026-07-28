'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
// Note: org + role auto-provisioning is handled by the handle_new_user DB trigger —
// no server-side round-trips required here.

/**
 * Safely extract a human-readable message from any Supabase AuthError.
 *
 * Problem: AuthApiError stores properties as non-enumerable on the class
 * prototype, so `JSON.stringify(error)` always returns "{}".
 * Solution: walk own + inherited enumerable/non-enumerable property names.
 */
function extractErrorMessage(error: unknown): string {
  if (!error) return 'An unexpected error occurred.'
  if (typeof error === 'string') return error

  const e = error as Record<string, unknown>

  // Most common: standard .message field
  if (typeof e.message === 'string' && e.message) return e.message

  // OAuth / Supabase API errors often include error_description
  if (typeof e.error_description === 'string' && e.error_description)
    return e.error_description

  // Fallback: serialise with all own property names to avoid the {} trap
  try {
    const serialised = JSON.stringify(error, Object.getOwnPropertyNames(error))
    if (serialised && serialised !== '{}') return serialised
  } catch {
    // ignore circular-reference errors
  }

  return 'An unexpected error occurred.'
}

export async function login(prevState: unknown, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required.' }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { error: 'Please enter a valid email address.' }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    const msg = extractErrorMessage(error)
    // Don't expose internal error details — return a safe message
    if (msg.toLowerCase().includes('invalid')) {
      return { error: 'Invalid email or password. Please try again.' }
    }
    return { error: msg }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(prevState: unknown, formData: FormData) {
  try {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const name = formData.get('name') as string
    const confirmPassword = formData.get('confirm-password') as string

    if (!email || !password || !name) {
      return { error: 'Name, email, and password are required.' }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return { error: 'Please enter a valid email address.' }
    }

    if (name.trim().length < 2) {
      return { error: 'Name must be at least 2 characters.' }
    }

    if (password.length < 8) {
      return { error: 'Password must be at least 8 characters long.' }
    }

    if (password !== confirmPassword) {
      return { error: 'Passwords do not match.' }
    }

    const supabase = await createClient()

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name.trim() },
      },
    })

    if (error) {
      const msg = extractErrorMessage(error)
      console.error('[signup] Supabase signUp error:', msg)
      if (
        msg.toLowerCase().includes('already registered') ||
        msg.toLowerCase().includes('user already registered') ||
        msg.toLowerCase().includes('email already')
      ) {
        return { error: 'An account with this email already exists. Please log in.' }
      }
      return { error: msg }
    }

    // Sanity-check: Supabase may return a fake user object (identities: [])
    // if "Confirm email" is enabled and the address is already in use.
    if (data?.user && data.user.identities?.length === 0) {
      return { error: 'An account with this email already exists. Please log in.' }
    }

    // Auto-provisioning is now handled database-side in the handle_new_user trigger function during signup to eliminate sequential network roundtrips.
  } catch (err: unknown) {
    const msg = extractErrorMessage(err)
    console.error('[signup] Caught exception:', msg)
    return { error: msg }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signInWithGithub() {
  const supabase = await createClient()
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    console.error('GitHub OAuth error:', error.message)
    redirect('/login?error=oauth_failed')
  }

  if (data.url) {
    redirect(data.url)
  }
}

export async function signout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}
