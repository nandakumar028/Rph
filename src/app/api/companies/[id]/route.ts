import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { getCompany, updateCompany, deleteCompany, logActivity, getUserProfile } from '@/utils/supabase/queries'

// GET /api/companies/[id]
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const company = await getCompany(supabase, id)
  if (!company) return NextResponse.json({ error: 'Company not found' }, { status: 404 })
  return NextResponse.json({ data: company })
}

// PUT /api/companies/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const profile = await getUserProfile(supabase)
  if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const company = await updateCompany(supabase, id, body)
  if (!company) return NextResponse.json({ error: 'Failed to update company' }, { status: 500 })

  await logActivity(supabase, {
    org_id: profile.org_id,
    actor_id: profile.id,
    entity_type: 'company',
    entity_id: id,
    activity_type: 'updated',
    payload: body,
  })

  return NextResponse.json({ data: company })
}

// DELETE /api/companies/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const profile = await getUserProfile(supabase)
  if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const ok = await deleteCompany(supabase, id)
  if (!ok) return NextResponse.json({ error: 'Failed to delete company' }, { status: 500 })

  await logActivity(supabase, {
    org_id: profile.org_id,
    actor_id: profile.id,
    entity_type: 'company',
    entity_id: id,
    activity_type: 'deleted',
    payload: {},
  })

  return NextResponse.json({ success: true })
}
