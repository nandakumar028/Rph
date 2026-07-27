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
  const profileRaw = await getUserProfile(supabase)

  if (!profileRaw) {
    redirect('/login')
  }

  // Normalise org / role from potential array or single object shapes
  const orgsRaw = profileRaw.organizations as unknown
  const org: OrgShape | null = Array.isArray(orgsRaw)
    ? (orgsRaw[0] as OrgShape) ?? null
    : (orgsRaw as OrgShape | null)

  const rolesRaw = profileRaw.roles as unknown
  const role: RoleShape | null = Array.isArray(rolesRaw)
    ? (rolesRaw[0] as RoleShape) ?? null
    : (rolesRaw as RoleShape | null)

  const rawCreatedAt = (profileRaw as Record<string, unknown>).created_at
  const joinedDate = new Date(
    typeof rawCreatedAt === 'string' ? rawCreatedAt : Date.now()
  ).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const profile: ProfileShape = profileRaw as ProfileShape

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
