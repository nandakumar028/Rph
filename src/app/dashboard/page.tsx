import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { getUserProfile } from '@/utils/supabase/queries'
import { signout } from '@/app/auth/actions'
import {
  User,
  Building2,
  Mail,
  Shield,
  LogOut,
  Layers,
  CheckCircle2,
  Clock,
  CalendarDays,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Your CRM Portal account overview and authentication details.',
  robots: { index: false, follow: false }, // Private page — never index
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const profile = await getUserProfile(supabase)

  if (!profile) {
    redirect('/login')
  }

  type OrgShape = { id: string; name: string; subdomain: string; plan_tier: string }
  type RoleShape = { id: string; name: string }

  const orgsRaw = profile.organizations as unknown
  const org: OrgShape | null = Array.isArray(orgsRaw)
    ? (orgsRaw[0] as OrgShape) ?? null
    : (orgsRaw as OrgShape | null)

  const rolesRaw = profile.roles as unknown
  const role: RoleShape | null = Array.isArray(rolesRaw)
    ? (rolesRaw[0] as RoleShape) ?? null
    : (rolesRaw as RoleShape | null)

  const displayName = profile.email?.split('@')[0] ?? 'User'
  const rawCreatedAt = (profile as unknown as Record<string, unknown>).created_at
  const joinedDate = new Date(typeof rawCreatedAt === 'string' ? rawCreatedAt : Date.now()).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Ambient background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[120px]" />
      </div>

      {/* Navbar */}
      <header className="relative z-10 border-b border-white/5 bg-white/[0.02] backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-600/30">
              <Layers className="size-4 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">CRM Portal</span>
          </div>
          <form action={signout}>
            <button
              id="signout-nav-btn"
              type="submit"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-200 cursor-pointer"
            >
              <LogOut className="size-4" />
              Sign Out
            </button>
          </form>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        {/* Welcome header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-4">
            <CheckCircle2 className="size-3.5" />
            Authenticated
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            Welcome back,{' '}
            <span className="text-violet-400">{displayName}</span>
          </h1>
          <p className="text-slate-400">Your account details and authentication information are below.</p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* User Profile Card */}
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm hover:border-white/[0.15] transition-colors">
            <CardHeader icon={<User className="size-5 text-violet-400" />} iconBg="bg-violet-500/20 border-violet-500/20" title="User Profile" subtitle="Authentication identity" />
            <div className="space-y-4">
              <InfoRow label="User ID" value={profile.id} mono />
              <InfoRow label="Email Address" value={profile.email} />
              <InfoRow
                label="Account Status"
                value={profile.status ?? 'active'}
                badge
                badgeColor={profile.status === 'active' ? 'emerald' : 'amber'}
              />
            </div>
          </div>

          {/* Organization Card */}
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm hover:border-white/[0.15] transition-colors">
            <CardHeader icon={<Building2 className="size-5 text-blue-400" />} iconBg="bg-blue-500/20 border-blue-500/20" title="Organization" subtitle="Tenant workspace details" />
            <div className="space-y-4">
              {org ? (
                <>
                  <InfoRow label="Org Name" value={org.name} />
                  <InfoRow label="Org ID" value={org.id} mono />
                  <InfoRow label="Subdomain" value={org.subdomain} mono />
                  <InfoRow label="Plan" value={org.plan_tier ?? 'free'} badge badgeColor="violet" />
                </>
              ) : (
                <p className="text-sm text-slate-500">No organization linked yet.</p>
              )}
            </div>
          </div>

          {/* Role & Permissions Card */}
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm hover:border-white/[0.15] transition-colors">
            <CardHeader icon={<Shield className="size-5 text-amber-400" />} iconBg="bg-amber-500/20 border-amber-500/20" title="Role & Permissions" subtitle="Access control details" />
            <div className="space-y-4">
              {role ? (
                <>
                  <InfoRow label="Role" value={role.name} badge badgeColor="amber" />
                  <InfoRow label="Role ID" value={role.id} mono />
                </>
              ) : (
                <InfoRow label="Role" value="Member (default)" badge badgeColor="amber" />
              )}
            </div>
          </div>

          {/* Session Card */}
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm hover:border-white/[0.15] transition-colors">
            <CardHeader icon={<Clock className="size-5 text-teal-400" />} iconBg="bg-teal-500/20 border-teal-500/20" title="Session Info" subtitle="Active authentication session" />
            <div className="space-y-4">
              <InfoRow label="Auth Provider" value="Email / Password" />
              <InfoRow label="Session Status" badge value="Active" badgeColor="emerald" />
            </div>
            <div className="mt-6 pt-5 border-t border-white/5">
              <form action={signout}>
                <button
                  id="signout-session-btn"
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:border-red-500/40 transition-all duration-200 text-sm font-medium cursor-pointer"
                >
                  <LogOut className="size-4" />
                  Sign Out of Account
                </button>
              </form>
            </div>
          </div>

        </div>

        {/* Full Identity Footer */}
        <div className="mt-5 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm">
          <CardHeader icon={<Mail className="size-5 text-pink-400" />} iconBg="bg-pink-500/20 border-pink-500/20" title="Contact & Identity" subtitle="Full authenticated user record" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-1">
            <InfoRow label="Email Address" value={profile.email} />
            <InfoRow label="Profile ID" value={profile.id} mono />
            {org && <InfoRow label="Workspace" value={org.subdomain} mono />}
          </div>
        </div>

        {/* Member Since */}
        <div className="mt-5 flex items-center gap-2 text-slate-600 text-xs">
          <CalendarDays className="size-3.5" />
          Member since {joinedDate}
        </div>
      </main>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function CardHeader({
  icon,
  iconBg,
  title,
  subtitle,
}: {
  icon: React.ReactNode
  iconBg: string
  title: string
  subtitle: string
}) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className={`size-10 rounded-xl border flex items-center justify-center ${iconBg}`}>
        {icon}
      </div>
      <div>
        <h2 className="font-semibold text-white">{title}</h2>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </div>
    </div>
  )
}

type BadgeColor = 'emerald' | 'amber' | 'violet' | 'blue' | 'teal'

function InfoRow({
  label,
  value,
  mono = false,
  badge = false,
  badgeColor = 'emerald',
}: {
  label: string
  value?: string | null
  mono?: boolean
  badge?: boolean
  badgeColor?: BadgeColor
}) {
  const badgeClasses: Record<BadgeColor, string> = {
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    violet: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    teal: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  }

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</span>
      {badge ? (
        <span
          className={`inline-flex w-fit items-center px-2.5 py-1 rounded-full border text-xs font-semibold capitalize ${badgeClasses[badgeColor]}`}
        >
          {value ?? '—'}
        </span>
      ) : (
        <span
          className={`text-sm text-slate-200 break-all ${mono ? 'font-mono text-xs text-slate-400' : ''}`}
          title={value ?? undefined}
        >
          {value ?? '—'}
        </span>
      )}
    </div>
  )
}
