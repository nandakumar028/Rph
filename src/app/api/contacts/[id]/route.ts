import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { getContact, updateContact, deleteContact, logActivity, getUserProfile } from '@/utils/supabase/queries'

// GET /api/contacts/[id]
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const profile = await getUserProfile(supabase)
  if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const contact = await getContact(supabase, id)
  if (!contact) return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
  return NextResponse.json({ data: contact })
}

// PUT /api/contacts/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const profile = await getUserProfile(supabase)
  if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const contact = await updateContact(supabase, id, body)
  if (!contact) return NextResponse.json({ error: 'Failed to update contact' }, { status: 500 })

  await logActivity(supabase, {
    org_id: profile.org_id,
    actor_id: profile.id,
    entity_type: 'contact',
    entity_id: id,
    activity_type: 'updated',
    payload: body,
  })

  return NextResponse.json({ data: contact })
}

// DELETE /api/contacts/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const profile = await getUserProfile(supabase)
  if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const ok = await deleteContact(supabase, id)
  if (!ok) return NextResponse.json({ error: 'Failed to delete contact' }, { status: 500 })

  await logActivity(supabase, {
    org_id: profile.org_id,
    actor_id: profile.id,
    entity_type: 'contact',
    entity_id: id,
    activity_type: 'deleted',
    payload: {},
  })

  return NextResponse.json({ success: true })
}
