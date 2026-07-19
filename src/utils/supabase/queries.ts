import { SupabaseClient } from '@supabase/supabase-js'

// ─────────────────────────────────────────────
// Auth / Profile helpers (Phase 1)
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

export async function updateUserProfile(supabase: SupabaseClient, userId: string, updates: any) {
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

// ─────────────────────────────────────────────
// LEADS
// ─────────────────────────────────────────────

export async function getLeads(
  supabase: SupabaseClient,
  opts?: { status?: string; owner_id?: string; limit?: number; offset?: number }
) {
  let query = supabase
    .from('leads')
    .select('*, profiles!owner_id(id, email)')
    .order('created_at', { ascending: false })

  if (opts?.status) query = query.eq('status', opts.status)
  if (opts?.owner_id) query = query.eq('owner_id', opts.owner_id)
  if (opts?.limit) query = query.limit(opts.limit)
  if (opts?.offset) query = query.range(opts.offset, (opts.offset + (opts.limit ?? 50)) - 1)

  const { data, error } = await query
  if (error) { console.error('getLeads error:', error); return null }
  return data
}

export async function getLead(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from('leads')
    .select('*, profiles!owner_id(id, email)')
    .eq('id', id)
    .single()
  if (error) { console.error('getLead error:', error); return null }
  return data
}

export async function createLead(
  supabase: SupabaseClient,
  payload: {
    org_id: string
    name: string
    email?: string
    phone?: string
    status?: string
    source?: string
    owner_id?: string
    notes?: string
  }
) {
  const { data, error } = await supabase
    .from('leads')
    .insert(payload)
    .select()
    .single()
  if (error) { console.error('createLead error:', error); return null }
  return data
}

export async function updateLead(
  supabase: SupabaseClient,
  id: string,
  payload: Partial<{
    name: string
    email: string
    phone: string
    status: string
    source: string
    owner_id: string
    notes: string
  }>
) {
  const { data, error } = await supabase
    .from('leads')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) { console.error('updateLead error:', error); return null }
  return data
}

export async function deleteLead(supabase: SupabaseClient, id: string) {
  const { error } = await supabase.from('leads').delete().eq('id', id)
  if (error) { console.error('deleteLead error:', error); return false }
  return true
}

// ─────────────────────────────────────────────
// COMPANIES
// ─────────────────────────────────────────────

export async function getCompanies(
  supabase: SupabaseClient,
  opts?: { limit?: number; offset?: number }
) {
  let query = supabase
    .from('companies')
    .select('*')
    .order('created_at', { ascending: false })

  if (opts?.limit) query = query.limit(opts.limit)
  if (opts?.offset) query = query.range(opts.offset, (opts.offset + (opts.limit ?? 50)) - 1)

  const { data, error } = await query
  if (error) { console.error('getCompanies error:', error); return null }
  return data
}

export async function getCompany(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('id', id)
    .single()
  if (error) { console.error('getCompany error:', error); return null }
  return data
}

export async function createCompany(
  supabase: SupabaseClient,
  payload: {
    org_id: string
    name: string
    industry?: string
    website?: string
    phone?: string
    address?: string
    city?: string
    country?: string
    size?: string
    notes?: string
  }
) {
  const { data, error } = await supabase
    .from('companies')
    .insert(payload)
    .select()
    .single()
  if (error) { console.error('createCompany error:', error); return null }
  return data
}

export async function updateCompany(
  supabase: SupabaseClient,
  id: string,
  payload: Partial<{
    name: string
    industry: string
    website: string
    phone: string
    address: string
    city: string
    country: string
    size: string
    notes: string
  }>
) {
  const { data, error } = await supabase
    .from('companies')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) { console.error('updateCompany error:', error); return null }
  return data
}

export async function deleteCompany(supabase: SupabaseClient, id: string) {
  const { error } = await supabase.from('companies').delete().eq('id', id)
  if (error) { console.error('deleteCompany error:', error); return false }
  return true
}

// ─────────────────────────────────────────────
// CONTACTS
// ─────────────────────────────────────────────

export async function getContacts(
  supabase: SupabaseClient,
  opts?: { company_id?: string; lead_id?: string; limit?: number; offset?: number }
) {
  let query = supabase
    .from('contacts')
    .select('*, companies(id, name), leads(id, name)')
    .order('created_at', { ascending: false })

  if (opts?.company_id) query = query.eq('company_id', opts.company_id)
  if (opts?.lead_id) query = query.eq('lead_id', opts.lead_id)
  if (opts?.limit) query = query.limit(opts.limit)
  if (opts?.offset) query = query.range(opts.offset, (opts.offset + (opts.limit ?? 50)) - 1)

  const { data, error } = await query
  if (error) { console.error('getContacts error:', error); return null }
  return data
}

export async function getContact(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from('contacts')
    .select('*, companies(id, name), leads(id, name)')
    .eq('id', id)
    .single()
  if (error) { console.error('getContact error:', error); return null }
  return data
}

export async function createContact(
  supabase: SupabaseClient,
  payload: {
    org_id: string
    first_name: string
    last_name?: string
    email?: string
    phone?: string
    job_title?: string
    lead_id?: string
    company_id?: string
    notes?: string
  }
) {
  const { data, error } = await supabase
    .from('contacts')
    .insert(payload)
    .select()
    .single()
  if (error) { console.error('createContact error:', error); return null }
  return data
}

export async function updateContact(
  supabase: SupabaseClient,
  id: string,
  payload: Partial<{
    first_name: string
    last_name: string
    email: string
    phone: string
    job_title: string
    lead_id: string
    company_id: string
    notes: string
  }>
) {
  const { data, error } = await supabase
    .from('contacts')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) { console.error('updateContact error:', error); return null }
  return data
}

export async function deleteContact(supabase: SupabaseClient, id: string) {
  const { error } = await supabase.from('contacts').delete().eq('id', id)
  if (error) { console.error('deleteContact error:', error); return false }
  return true
}

// ─────────────────────────────────────────────
// DEALS
// ─────────────────────────────────────────────

export async function getDeals(
  supabase: SupabaseClient,
  opts?: { stage?: string; owner_id?: string; limit?: number; offset?: number }
) {
  let query = supabase
    .from('deals')
    .select('*, contacts(id, first_name, last_name), companies(id, name), profiles!owner_id(id, email)')
    .order('created_at', { ascending: false })

  if (opts?.stage) query = query.eq('stage', opts.stage)
  if (opts?.owner_id) query = query.eq('owner_id', opts.owner_id)
  if (opts?.limit) query = query.limit(opts.limit)
  if (opts?.offset) query = query.range(opts.offset, (opts.offset + (opts.limit ?? 50)) - 1)

  const { data, error } = await query
  if (error) { console.error('getDeals error:', error); return null }
  return data
}

export async function getDeal(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from('deals')
    .select('*, contacts(id, first_name, last_name), companies(id, name), profiles!owner_id(id, email)')
    .eq('id', id)
    .single()
  if (error) { console.error('getDeal error:', error); return null }
  return data
}

export async function createDeal(
  supabase: SupabaseClient,
  payload: {
    org_id: string
    title: string
    amount?: number
    currency?: string
    stage?: string
    close_date?: string
    probability?: number
    contact_id?: string
    company_id?: string
    owner_id?: string
    notes?: string
  }
) {
  const { data, error } = await supabase
    .from('deals')
    .insert(payload)
    .select()
    .single()
  if (error) { console.error('createDeal error:', error); return null }
  return data
}

export async function updateDeal(
  supabase: SupabaseClient,
  id: string,
  payload: Partial<{
    title: string
    amount: number
    currency: string
    stage: string
    close_date: string
    probability: number
    contact_id: string
    company_id: string
    owner_id: string
    notes: string
  }>
) {
  const { data, error } = await supabase
    .from('deals')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) { console.error('updateDeal error:', error); return null }
  return data
}

export async function deleteDeal(supabase: SupabaseClient, id: string) {
  const { error } = await supabase.from('deals').delete().eq('id', id)
  if (error) { console.error('deleteDeal error:', error); return false }
  return true
}

// ─────────────────────────────────────────────
// TICKETS
// ─────────────────────────────────────────────

export async function getTickets(
  supabase: SupabaseClient,
  opts?: { status?: string; priority?: string; owner_id?: string; limit?: number; offset?: number }
) {
  let query = supabase
    .from('tickets')
    .select('*, profiles!owner_id(id, email), contacts(id, first_name, last_name)')
    .order('created_at', { ascending: false })

  if (opts?.status) query = query.eq('status', opts.status)
  if (opts?.priority) query = query.eq('priority', opts.priority)
  if (opts?.owner_id) query = query.eq('owner_id', opts.owner_id)
  if (opts?.limit) query = query.limit(opts.limit)
  if (opts?.offset) query = query.range(opts.offset, (opts.offset + (opts.limit ?? 50)) - 1)

  const { data, error } = await query
  if (error) { console.error('getTickets error:', error); return null }
  return data
}

export async function getTicket(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from('tickets')
    .select('*, profiles!owner_id(id, email), contacts(id, first_name, last_name)')
    .eq('id', id)
    .single()
  if (error) { console.error('getTicket error:', error); return null }
  return data
}

export async function createTicket(
  supabase: SupabaseClient,
  payload: {
    org_id: string
    subject: string
    description?: string
    status?: string
    priority?: string
    owner_id?: string
    contact_id?: string
  }
) {
  const { data, error } = await supabase
    .from('tickets')
    .insert(payload)
    .select()
    .single()
  if (error) { console.error('createTicket error:', error); return null }
  return data
}

export async function updateTicket(
  supabase: SupabaseClient,
  id: string,
  payload: Partial<{
    subject: string
    description: string
    status: string
    priority: string
    owner_id: string
    contact_id: string
    resolved_at: string
  }>
) {
  const { data, error } = await supabase
    .from('tickets')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) { console.error('updateTicket error:', error); return null }
  return data
}

export async function deleteTicket(supabase: SupabaseClient, id: string) {
  const { error } = await supabase.from('tickets').delete().eq('id', id)
  if (error) { console.error('deleteTicket error:', error); return false }
  return true
}

// ─────────────────────────────────────────────
// ACTIVITIES
// ─────────────────────────────────────────────

export async function logActivity(
  supabase: SupabaseClient,
  payload: {
    org_id: string
    actor_id: string
    entity_type: 'lead' | 'contact' | 'company' | 'deal' | 'ticket'
    entity_id: string
    activity_type: 'created' | 'updated' | 'deleted' | 'note' | 'email' | 'call' | 'meeting'
    payload?: Record<string, unknown>
  }
) {
  const { error } = await supabase.from('activities').insert(payload)
  if (error) console.error('logActivity error:', error)
}

export async function getActivities(
  supabase: SupabaseClient,
  entity_type: string,
  entity_id: string
) {
  const { data, error } = await supabase
    .from('activities')
    .select('*, profiles!actor_id(id, email)')
    .eq('entity_type', entity_type)
    .eq('entity_id', entity_id)
    .order('created_at', { ascending: false })
  if (error) { console.error('getActivities error:', error); return null }
  return data
}
