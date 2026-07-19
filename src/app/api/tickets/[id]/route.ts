import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { getTicket, updateTicket, deleteTicket, logActivity, getUserProfile } from '@/utils/supabase/queries'

// GET /api/tickets/[id]
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const profile = await getUserProfile(supabase)
  if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const ticket = await getTicket(supabase, id)
  if (!ticket) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
  return NextResponse.json({ data: ticket })
}

// PUT /api/tickets/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const profile = await getUserProfile(supabase)
  if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()

  // Auto-set resolved_at when status moves to resolved/closed
  if (body.status === 'resolved' || body.status === 'closed') {
    body.resolved_at = new Date().toISOString()
  }

  const ticket = await updateTicket(supabase, id, body)
  if (!ticket) return NextResponse.json({ error: 'Failed to update ticket' }, { status: 500 })

  await logActivity(supabase, {
    org_id: profile.org_id,
    actor_id: profile.id,
    entity_type: 'ticket',
    entity_id: id,
    activity_type: 'updated',
    payload: body,
  })

  return NextResponse.json({ data: ticket })
}

// DELETE /api/tickets/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const profile = await getUserProfile(supabase)
  if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const ok = await deleteTicket(supabase, id)
  if (!ok) return NextResponse.json({ error: 'Failed to delete ticket' }, { status: 500 })

  await logActivity(supabase, {
    org_id: profile.org_id,
    actor_id: profile.id,
    entity_type: 'ticket',
    entity_id: id,
    activity_type: 'deleted',
    payload: {},
  })

  return NextResponse.json({ success: true })
}
