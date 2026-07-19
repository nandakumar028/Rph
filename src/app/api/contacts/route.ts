import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { getContacts, createContact, getUserProfile } from '@/utils/supabase/queries'

// GET /api/contacts
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const profile = await getUserProfile(supabase)
  if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(request.url)

  const opts = {
    company_id: searchParams.get('company_id') ?? undefined,
    lead_id: searchParams.get('lead_id') ?? undefined,
    limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 50,
    offset: searchParams.get('offset') ? Number(searchParams.get('offset')) : 0,
  }

  const contacts = await getContacts(supabase, opts)
  if (!contacts) return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 })
  return NextResponse.json({ data: contacts, count: contacts.length })
}

// POST /api/contacts
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const profile = await getUserProfile(supabase)
  if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { first_name, last_name, email, phone, job_title, lead_id, company_id, notes } = body

  if (!first_name) return NextResponse.json({ error: 'first_name is required' }, { status: 400 })

  const contact = await createContact(supabase, {
    org_id: profile.org_id,
    first_name,
    last_name,
    email,
    phone,
    job_title,
    lead_id,
    company_id,
    notes,
  })

  if (!contact) return NextResponse.json({ error: 'Failed to create contact' }, { status: 500 })
  return NextResponse.json({ data: contact }, { status: 201 })
}
