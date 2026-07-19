import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { getDeal, updateDeal, deleteDeal, logActivity, getUserProfile } from '@/utils/supabase/queries'

// GET /api/deals/[id]
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const deal = await getDeal(supabase, id)
  if (!deal) return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
  return NextResponse.json({ data: deal })
}

// PUT /api/deals/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const profile = await getUserProfile(supabase)
  if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const deal = await updateDeal(supabase, id, body)
  if (!deal) return NextResponse.json({ error: 'Failed to update deal' }, { status: 500 })

  await logActivity(supabase, {
    org_id: profile.org_id,
    actor_id: profile.id,
    entity_type: 'deal',
    entity_id: id,
    activity_type: 'updated',
    payload: body,
  })

  return NextResponse.json({ data: deal })
}

// DELETE /api/deals/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const profile = await getUserProfile(supabase)
  if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const ok = await deleteDeal(supabase, id)
  if (!ok) return NextResponse.json({ error: 'Failed to delete deal' }, { status: 500 })

  await logActivity(supabase, {
    org_id: profile.org_id,
    actor_id: profile.id,
    entity_type: 'deal',
    entity_id: id,
    activity_type: 'deleted',
    payload: {},
  })

  return NextResponse.json({ success: true })
}
