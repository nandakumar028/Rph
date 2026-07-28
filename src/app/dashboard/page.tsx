import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { getUserProfile } from '@/utils/supabase/queries'
import { signout } from '@/app/auth/actions'
import type { OrgShape, RoleShape, ProfileShape } from '@/types'
import DashboardView from '@/components/dashboard-view'

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Your Rph Portal account overview and housing management.',
  // Private page — search engines should never index this
  robots: { index: false, follow: false },
}

export default async function DashboardPage() {
  const supabase = await createClient()

  // First verify the user is actually authenticated
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Try to get the full profile — may be null if trigger hasn't run yet
  const profileRaw = await getUserProfile(supabase)

  // Fall back to auth user data if profile row doesn't exist yet
  const effectiveProfile = profileRaw ?? {
    id: user!.id,
    full_name: user!.user_metadata?.full_name ?? user!.email ?? 'User',
    email: user!.email ?? '',
    created_at: user!.created_at,
    organizations: null,
    roles: null,
  }

  // Normalise org / role from potential array or single object shapes
  const orgsRaw = effectiveProfile.organizations as unknown
  const org: OrgShape | null = Array.isArray(orgsRaw)
    ? (orgsRaw[0] as OrgShape) ?? null
    : (orgsRaw as OrgShape | null)

  const rolesRaw = effectiveProfile.roles as unknown
  const role: RoleShape | null = Array.isArray(rolesRaw)
    ? (rolesRaw[0] as RoleShape) ?? null
    : (rolesRaw as RoleShape | null)

  const rawCreatedAt = (effectiveProfile as Record<string, unknown>).created_at
  const joinedDate = typeof rawCreatedAt === 'string'
    ? new Date(rawCreatedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Unknown'

  const profile: ProfileShape = effectiveProfile as ProfileShape

  return (
    <DashboardView
      profile={profile}
      org={org}
      role={role}
      joinedDate={joinedDate}
      signOutAction={signout}
    />
  )
}
