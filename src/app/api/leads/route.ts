import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { getLeads, createLead, logActivity, getUserProfile } from '@/utils/supabase/queries'

// Route Handlers

// GET /api/leads
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const profile = await getUserProfile(supabase)
  if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(request.url)

  const opts = {
    status: searchParams.get('status') ?? undefined,
    owner_id: searchParams.get('owner_id') ?? undefined,
    limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 50,
    offset: searchParams.get('offset') ? Number(searchParams.get('offset')) : 0,
  }

  const leads = await getLeads(supabase, opts)
  if (!leads) return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 })
  return NextResponse.json({ data: leads, count: leads.length })
}

// POST /api/leads
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const profile = await getUserProfile(supabase)
  if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { name, email, phone, status, source, owner_id, notes } = body

  if (!name) return NextResponse.json({ error: 'name is required' }, { status: 400 })

  const lead = await createLead(supabase, {
    org_id: profile.org_id,
    name,
    email,
    phone,
    status,
    source,
    owner_id: owner_id ?? profile.id,
    notes,
  })

  if (!lead) return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 })

  await logActivity(supabase, {
    org_id: profile.org_id,
    actor_id: profile.id,
    entity_type: 'lead',
    entity_id: lead.id,
    activity_type: 'created',
    payload: { name },
  })

  return NextResponse.json({ data: lead }, { status: 201 })
}
