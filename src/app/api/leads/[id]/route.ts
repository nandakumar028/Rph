import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { getLead, updateLead, deleteLead, logActivity, getUserProfile } from '@/utils/supabase/queries'

// GET /api/leads/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const lead = await getLead(supabase, id)
  if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
  return NextResponse.json({ data: lead })
}

// PUT /api/leads/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const profile = await getUserProfile(supabase)
  if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const lead = await updateLead(supabase, id, body)
  if (!lead) return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 })

  await logActivity(supabase, {
    org_id: profile.org_id,
    actor_id: profile.id,
    entity_type: 'lead',
    entity_id: id,
    activity_type: 'updated',
    payload: body,
  })

  return NextResponse.json({ data: lead })
}

// DELETE /api/leads/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const profile = await getUserProfile(supabase)
  if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const ok = await deleteLead(supabase, id)
  if (!ok) return NextResponse.json({ error: 'Failed to delete lead' }, { status: 500 })

  await logActivity(supabase, {
    org_id: profile.org_id,
    actor_id: profile.id,
    entity_type: 'lead',
    entity_id: id,
    activity_type: 'deleted',
    payload: {},
  })

  return NextResponse.json({ success: true })
}
