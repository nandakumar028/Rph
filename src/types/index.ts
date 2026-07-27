/**
 * Shared domain types for the Rph Portal.
 * Import these instead of re-declaring inline shapes in every file.
 */

// ─── Auth / Profile ───────────────────────────────────────────────────────────

export interface OrgShape {
  id: string
  name: string
  subdomain: string
  plan_tier: string
}

export interface RoleShape {
  id: string
  name: string
  permissions?: string[] | null
}

export interface ProfileShape {
  id: string
  email: string
  status?: string | null
  org_id?: string | null
  role_id?: string | null
  created_at?: string | null
  organizations?: OrgShape | OrgShape[] | null
  roles?: RoleShape | RoleShape[] | null
}

// ─── Housing ─────────────────────────────────────────────────────────────────

export interface Property {
  id: string
  title: string
  address: string
  type: 'Apartment' | 'House' | 'Studio' | 'Room'
  price: number
  bedrooms: number
  bathrooms: number
  status: 'Available' | 'Occupied' | 'Maintenance'
  tenantName?: string
  leaseStart?: string
  leaseEnd?: string
  /** Tailwind gradient class e.g. "from-blue-600 to-indigo-900" */
  imageBg: string
}
