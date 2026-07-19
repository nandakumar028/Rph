import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { getTickets, createTicket, getUserProfile } from '@/utils/supabase/queries'

// GET /api/tickets
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)

  const opts = {
    status: searchParams.get('status') ?? undefined,
    priority: searchParams.get('priority') ?? undefined,
    owner_id: searchParams.get('owner_id') ?? undefined,
    limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 50,
    offset: searchParams.get('offset') ? Number(searchParams.get('offset')) : 0,
  }

  const tickets = await getTickets(supabase, opts)
  if (!tickets) return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 })
  return NextResponse.json({ data: tickets, count: tickets.length })
}

// POST /api/tickets
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const profile = await getUserProfile(supabase)
  if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { subject, description, status, priority, owner_id, contact_id } = body

  if (!subject) return NextResponse.json({ error: 'subject is required' }, { status: 400 })

  const ticket = await createTicket(supabase, {
    org_id: profile.org_id,
    subject,
    description,
    status,
    priority,
    owner_id: owner_id ?? profile.id,
    contact_id,
  })

  if (!ticket) return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 })
  return NextResponse.json({ data: ticket }, { status: 201 })
}
