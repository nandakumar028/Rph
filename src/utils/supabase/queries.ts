import { SupabaseClient } from '@supabase/supabase-js'

// ─────────────────────────────────────────────
// Auth / Profile helpers
// ─────────────────────────────────────────────

export async function getUserProfile(supabase: SupabaseClient) {
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return null
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select(`
      id,
      email,
      status,
      org_id,
      role_id,
      created_at,
      organizations (
        id,
        name,
        subdomain,
        plan_tier
      ),
      roles (
        id,
        name,
        permissions
      )
    `)
    .eq('id', user.id)
    .single()

  if (profileError) {
    console.error('Error fetching user profile:', profileError)
    return null
  }

  return profile
}

export async function getOrganization(supabase: SupabaseClient, orgId: string) {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', orgId)
    .single()

  if (error) {
    console.error('Error fetching organization:', error)
    return null
  }

  return data
}

export async function createOrganization(supabase: SupabaseClient, name: string, subdomain: string) {
  const { data, error } = await supabase
    .from('organizations')
    .insert([{ name, subdomain }])
    .select()
    .single()

  if (error) {
    console.error('Error creating organization:', error)
    return null
  }

  return data
}

export async function updateUserProfile(supabase: SupabaseClient, userId: string, updates: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    console.error('Error updating profile:', error)
    return null
  }

  return data
}

export async function getProfileRole(supabase: SupabaseClient, roleId: string) {
  const { data, error } = await supabase
    .from('roles')
    .select('*')
    .eq('id', roleId)
    .single()

  if (error) {
    console.error('Error fetching role:', error)
    return null
  }

  return data
}
